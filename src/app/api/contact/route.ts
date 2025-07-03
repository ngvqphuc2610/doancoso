"use server";

import { NextRequest, NextResponse } from 'next/server';
import pool from "@/config/db";
import nodemailer from "nodemailer";
import { ResultSetHeader } from "mysql2";
import {createSuccessResponse,createErrorResponse, handleApiError } from '@/lib/apiUtils';
import { validateRequired, validateEmail } from '@/lib/validation';


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        // Validate input
        const requiredCheck = validateRequired(body, ['name', 'email', 'subject', 'message']);
        if (!requiredCheck.valid) {
            return requiredCheck.error;
        }

         // Validate email format
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) {
            return emailCheck.error;
        }


        // Check email configuration
        if (!process.env.EMAIL || !process.env.EMAIL_APP_PASSWORD) {
            console.error("Email configuration missing");
            return createErrorResponse(
                "Cấu hình email server chưa được thiết lập.",
                500,
                'CONFIG_ERROR'
            );
        }

        // Save to database first (id_staff sẽ là NULL cho đến khi admin reply)
        const query = "INSERT INTO CONTACT (name, email, subject, message, status, id_staff) VALUES (?, ?, ?, ?, 'unread', NULL)";
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

            // Setup email content with improved formatting
            const mailOptions = {
                from: `"${name} (FORM CSKH)" <${process.env.EMAIL}>`, // Hiển thị tên người gửi form
                to: process.env.EMAIL,
                replyTo: `"${name}" <${email}>`, // Đảm bảo reply sẽ gửi đến email của khách hàng
                subject: `[Website Contact] ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Tin nhắn mới từ form CSKH</h2>

                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Người gửi:</strong> ${name}</p>
                            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            <p><strong>Chủ đề:</strong> ${subject}</p>

                            <div style="margin-top: 20px;">
                                <strong>Nội dung:</strong>
                                <div style="padding: 15px; background-color: #ffffff; border-left: 4px solid #3498db; margin-top: 10px;">
                                    ${message.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                        </div>

                        <p style="color: #7f8c8d; font-size: 0.9em;">
                            Bạn có thể trả lời trực tiếp email này để phản hồi tới ${name}.
                        </p>
                    </div>
                `
            };

            // Send email
            await transporter.sendMail(mailOptions);

           return createSuccessResponse({
                message: "Thông tin của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.",
                contactId: result.insertId
            },
            "Thông tin của bạn đã được gửi thành công! "
            );

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

    } catch (error) {
        return handleApiError(error, 'Failed to send contact information');
    }
}