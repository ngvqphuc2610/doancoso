import { Request, Response } from "express";
import pool from "../config/db";
import nodemailer from "nodemailer";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Cập nhật interface cho dữ liệu liên hệ
interface ContactData {
    id_contact?: number;
    id_staff?: number | null;
    name: string;
    email: string;
    subject: string;
    message: string;
    contact_date?: Date;
    status?: string;
    reply?: string | null;
    reply_date?: Date | null;
}

// Xử lý form liên hệ
export const handleContactForm = async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Địa chỉ email không hợp lệ!" });
        }

        // Lưu thông tin vào cơ sở dữ liệu
        const query = "INSERT INTO CONTACT (name, email, subject, message, status) VALUES (?, ?, ?, ?, 'unread')";
        const [result] = await pool.execute<ResultSetHeader>(query, [name, email, subject, message]);

        console.log("Dữ liệu đã được lưu:", result);

        // Gửi email thông báo
        if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
            return res.status(500).json({ error: "Cấu hình email không hợp lệ." });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: process.env.CONTACT_EMAIL || "cskh@cinestar.com.vn",
            subject: `Liên hệ mới: ${subject}`,
            text: `Họ tên: ${name}\nEmail: ${email}\nChủ đề: ${subject}\nNội dung: ${message}`,
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

        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: "Thông tin đã được gửi thành công!",
            contactId: result.insertId
        });

    } catch (error: any) {
        console.error("Lỗi xử lý:", error);
        res.status(500).json({
            success: false,
            error: "Đã xảy ra lỗi khi xử lý yêu cầu.",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Lấy danh sách liên hệ
export const getContacts = async (req: Request, res: Response) => {
    try {
        // Phân trang
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // Truy vấn danh sách liên hệ
        const [contacts] = await pool.execute<RowDataPacket[]>(
            `SELECT c.*, s.name as staff_name 
             FROM CONTACT c 
             LEFT JOIN STAFF s ON c.id_staff = s.id_staff 
             ORDER BY c.contact_date DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        // Đếm tổng số liên hệ
        const [countResult] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as total FROM CONTACT");
        const totalContacts = countResult[0].total;

        res.status(200).json({
            contacts,
            pagination: {
                total: totalContacts,
                page,
                limit,
                totalPages: Math.ceil(totalContacts / limit)
            }
        });
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách liên hệ:", error);
        res.status(500).json({
            success: false,
            error: "Không thể lấy danh sách liên hệ."
        });
    }
};

// Lấy chi tiết một liên hệ
export const getContactById = async (req: Request, res: Response) => {
    try {
        const contactId = req.params.id;

        const [contacts] = await pool.execute<RowDataPacket[]>(
            `SELECT c.*, s.name as staff_name 
             FROM CONTACT c 
             LEFT JOIN STAFF s ON c.id_staff = s.id_staff 
             WHERE c.id_contact = ?`,
            [contactId]
        );

        if (contacts.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy thông tin liên hệ." });
        }

        // Đánh dấu là đã đọc nếu chưa đọc
        if (contacts[0].status === 'unread') {
            await pool.execute(
                "UPDATE CONTACT SET status = 'read' WHERE id_contact = ? AND status = 'unread'",
                [contactId]
            );
        }

        res.status(200).json({
            success: true,
            contact: contacts[0]
        });
    } catch (error: any) {
        console.error("Lỗi khi lấy chi tiết liên hệ:", error);
        res.status(500).json({
            success: false,
            error: "Không thể lấy thông tin liên hệ."
        });
    }
};

// Trả lời liên hệ
export const replyContact = async (req: Request, res: Response) => {
    try {
        const contactId = req.params.id;
        const { reply, id_staff } = req.body;

        if (!reply) {
            return res.status(400).json({ error: "Vui lòng nhập nội dung phản hồi." });
        }

        // Lấy thông tin liên hệ
        const [contacts] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM CONTACT WHERE id_contact = ?",
            [contactId]
        );

        if (contacts.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy thông tin liên hệ." });
        }

        const contact = contacts[0];

        // Cập nhật trạng thái và phản hồi
        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE CONTACT SET status = 'replied', reply = ?, reply_date = NOW(), id_staff = ? WHERE id_contact = ?",
            [reply, id_staff, contactId]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Không thể cập nhật phản hồi." });
        }

        // Gửi email phản hồi cho khách hàng
        if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
            return res.status(500).json({ error: "Cấu hình email không hợp lệ." });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: contact.email,
            subject: `Phản hồi: ${contact.subject}`,
            text: `Kính gửi ${contact.name},\n\nPhản hồi cho yêu cầu của bạn:\n\n${reply}\n\nTrân trọng,\nĐội ngũ Chăm sóc Khách hàng`,
            html: `
                <h2>Phản hồi từ Cinestar</h2>
                <p>Kính gửi ${contact.name},</p>
                <p>Chúng tôi đã nhận được yêu cầu của bạn với tiêu đề: <strong>${contact.subject}</strong></p>
                <p>Phản hồi của chúng tôi:</p>
                <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #007bff;">
                    ${reply.replace(/\n/g, '<br>')}
                </div>
                <p style="margin-top: 20px;">Trân trọng,</p>
                <p>Đội ngũ Chăm sóc Khách hàng</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Đã gửi phản hồi thành công!"
        });
    } catch (error: any) {
        console.error("Lỗi khi gửi phản hồi:", error);
        res.status(500).json({
            success: false,
            error: "Không thể gửi phản hồi."
        });
    }
};

// Xóa một liên hệ
export const deleteContact = async (req: Request, res: Response) => {
    try {
        const contactId = req.params.id;

        const [result] = await pool.execute<ResultSetHeader>(
            "DELETE FROM CONTACT WHERE id_contact = ?",
            [contactId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy thông tin liên hệ." });
        }

        res.status(200).json({
            success: true,
            message: "Xóa liên hệ thành công!"
        });
    } catch (error: any) {
        console.error("Lỗi khi xóa liên hệ:", error);
        res.status(500).json({
            success: false,
            error: "Không thể xóa liên hệ."
        });
    }
};