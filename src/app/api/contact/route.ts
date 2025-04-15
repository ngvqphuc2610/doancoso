import { NextRequest, NextResponse } from 'next/server';
import pool from "@/config/db";
import nodemailer from "nodemailer";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        // Validate input
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Vui lòng nhập đầy đủ thông tin!" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Địa chỉ email không hợp lệ!" },
                { status: 400 }
            );
        }

        // Check email configuration
        if (!process.env.EMAIL || !process.env.EMAIL_APP_PASSWORD) {
            console.error("Email configuration missing");
            return NextResponse.json(
                { error: "Cấu hình email server chưa được thiết lập." },
                { status: 500 }
            );
        }

        // Save to database first
        const query = "INSERT INTO CONTACT (name, email, subject, message, status) VALUES (?, ?, ?, ?, 'unread')";
        const [result] = await pool.execute<ResultSetHeader>(query, [name, email, subject, message]);

        try {
            // Create Gmail transporter with secure configuration
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_APP_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Setup email content
            const mailOptions = {
                from: `"${name}" <${process.env.EMAIL}>`, // Use authenticated email as sender
                replyTo: email, // Set reply-to as the contact email
                to: process.env.EMAIL,
                subject: `Liên hệ mới: ${subject}`,
                html: `
                    <h2>Thông tin liên hệ mới</h2>
                    <p><strong>Họ tên:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Chủ đề:</strong> ${subject}</p>
                    <p><strong>Nội dung:</strong></p>
                    <div style="padding: 10px; background-color: #f5f5f5; border-left: 4px solid #ccc;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                `
            };

            // Send email
            await transporter.sendMail(mailOptions);

            return NextResponse.json({
                success: true,
                message: "Thông tin đã được gửi thành công!",
                contactId: result.insertId
            });

        } catch (emailError: any) {
            // If email fails, update the contact status in database
            await pool.execute(
                "UPDATE CONTACT SET status = 'email_failed' WHERE id_contact = ?",
                [result.insertId]
            );

            console.error("Email sending error:", emailError);
            return NextResponse.json({
                success: false,
                error: "Thông tin của bạn đã được lưu, nhưng không thể gửi email thông báo. Chúng tôi sẽ liên hệ lại sau.",
                details: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
                contactSaved: true
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Request processing error:", error);
        return NextResponse.json({
            success: false,
            error: "Đã xảy ra lỗi khi xử lý yêu cầu.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}