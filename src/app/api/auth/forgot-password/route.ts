import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// POST - Gửi email reset password
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'Email là bắt buộc'
            }, { status: 400 });
        }

        // Check if user exists
        const users = await query('SELECT id_users, full_name FROM users WHERE email = ? AND status = "active"', [email]);

        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Email không tồn tại trong hệ thống'
            }, { status: 404 });
        }

        const user = users[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token to database
        await query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id_users = ?',
            [resetToken, resetTokenExpiry, user.id_users]
        );

        // Create reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        // Configure email transporter (using Gmail as example)
        // Check if email configuration exists
        if (!process.env.EMAIL || !process.env.EMAIL_APP_PASSWORD) {
            console.log('Email configuration not found. Reset token saved but email not sent.');
            console.log('Reset URL:', resetUrl);
            // In development, we'll still return success even without email config
            return NextResponse.json({
                success: true,
                message: 'Email đặt lại mật khẩu đã được gửi (Development mode - check console for reset URL)',
                resetUrl: resetUrl // Only in development
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        // Email template
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Đặt lại mật khẩu - Alex',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Đặt lại mật khẩu - Alex</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
                        <!-- Header -->
                        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #3B82F6;">
                            <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">🎬 Alex</h1>
                            <p style="color: #666; margin: 5px 0 0 0;">Hệ thống đặt vé xem phim</p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 30px 0;">
                            <h2 style="color: #333; margin-bottom: 20px;">Đặt lại mật khẩu</h2>
                            <p style="color: #555; line-height: 1.6;">Xin chào <strong>${user.full_name}</strong>,</p>
                            <p style="color: #555; line-height: 1.6;">
                                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Alex của mình.
                                Để tiếp tục, vui lòng nhấp vào nút bên dưới:
                            </p>

                            <!-- Reset Button -->
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${resetUrl}"
                                   style="background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                                    🔐 Đặt lại mật khẩu
                                </a>
                            </div>

                            <!-- Alternative Link -->
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="color: #555; margin: 0 0 10px 0; font-size: 14px;">
                                    Nếu nút không hoạt động, vui lòng copy và paste link sau vào trình duyệt:
                                </p>
                                <p style="word-break: break-all; color: #3B82F6; margin: 0; font-size: 14px; background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
                                    ${resetUrl}
                                </p>
                            </div>

                            <!-- Security Notice -->
                            <div style="background-color: #fef3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="color: #856404; margin: 0; font-size: 14px;">
                                    <strong>⚠️ Lưu ý bảo mật:</strong><br>
                                    • Link này sẽ hết hạn sau <strong>1 giờ</strong><br>
                                    • Chỉ sử dụng được <strong>1 lần</strong><br>
                                    • Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="border-top: 1px solid #e5e7eb; padding: 20px 0; text-align: center;">
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                Email này được gửi tự động từ hệ thống Alex<br>
                                Vui lòng không trả lời email này
                            </p>
                            <p style="color: #999; font-size: 11px; margin: 10px 0 0 0;">
                                © 2025 Alex. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send email
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
        } catch (emailError) {
            console.error('Error sending email:', emailError);

            // Return error if email fails to send
            return NextResponse.json({
                success: false,
                message: 'Không thể gửi email. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
                error: process.env.NODE_ENV === 'development' ? emailError : undefined
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Email đặt lại mật khẩu đã được gửi'
        });

    } catch (error) {
        console.error('Error in forgot password:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server'
        }, { status: 500 });
    }
}
