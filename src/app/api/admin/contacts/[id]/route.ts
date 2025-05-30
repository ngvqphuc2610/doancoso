import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/db';
import { requireAuth } from '@/lib/auth';
import nodemailer from 'nodemailer';

// GET - Lấy chi tiết contact
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check admin authentication
        const authResult = await requireAuth(request, 'admin');
        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                message: authResult.message
            }, { status: authResult.status });
        }

        const { id } = await params;

        const contactQuery = `
            SELECT
                c.id_contact,
                c.name,
                c.email,
                c.subject,
                c.message,
                c.contact_date,
                c.status,
                c.reply,
                c.reply_date,
                c.id_staff,
                s.staff_name,
                s.email as staff_email,
                s.phone_number as staff_phone
            FROM contact c
            LEFT JOIN staff s ON c.id_staff = s.id_staff
            WHERE c.id_contact = ?
        `;

        const contacts = await query(contactQuery, [id]);
        const contact = (contacts as any[])[0];

        if (!contact) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy liên hệ'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Error fetching contact:', error);
        return NextResponse.json({
            success: false,
            message: 'Không thể tải thông tin liên hệ'
        }, { status: 500 });
    }
}

// PUT - Cập nhật contact và gửi reply
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check admin authentication
        const authResult = await requireAuth(request, 'admin');
        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                message: authResult.message
            }, { status: authResult.status });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, reply, sendEmail = false } = body;

        // Get current contact info
        const contacts = await query(
            'SELECT * FROM contact WHERE id_contact = ?',
            [id]
        );
        const contact = (contacts as any[])[0];

        if (!contact) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy liên hệ'
            }, { status: 404 });
        }

        // Update contact
        let updateQuery = 'UPDATE contact SET ';
        let updateParams: any[] = [];
        let updateFields: string[] = [];

        if (status) {
            updateFields.push('status = ?');
            updateParams.push(status);
        }

        if (reply) {
            // Chỉ gán id_staff khi có reply (trả lời)
            updateFields.push('reply = ?, reply_date = NOW(), id_staff = ?');
            updateParams.push(reply, authResult.user?.id || null);

            // Tự động set status thành 'replied' khi có reply
            if (!status || status !== 'replied') {
                updateFields.push('status = ?');
                updateParams.push('replied');
            }
        }

        if (updateFields.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Không có thông tin để cập nhật'
            }, { status: 400 });
        }

        updateQuery += updateFields.join(', ') + ' WHERE id_contact = ?';
        updateParams.push(id);

        await query(updateQuery, updateParams);

        // Send email reply if requested
        if (sendEmail && reply && contact.email) {
            try {
                if (!process.env.EMAIL || !process.env.EMAIL_APP_PASSWORD) {
                    throw new Error('Email configuration missing');
                }

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

                const mailOptions = {
                    from: `"AlexNguyen Đẹp Trai" <${process.env.EMAIL}>`,
                    to: contact.email,
                    subject: `Re: ${contact.subject}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                                Phản hồi từ AlexNguyen
                            </h2>

                            <p>Xin chào ${contact.name},</p>

                            <p>Cảm ơn bạn đã liên hệ với chúng tôi. Dưới đây là phản hồi cho yêu cầu của bạn:</p>

                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <p><strong>Chủ đề gốc:</strong> ${contact.subject}</p>
                                <p><strong>Tin nhắn gốc:</strong></p>
                                <div style="padding: 10px; background-color: #ffffff; border-left: 4px solid #bdc3c7; margin: 10px 0;">
                                    ${contact.message.replace(/\n/g, '<br>')}
                                </div>

                                <p><strong>Phản hồi:</strong></p>
                                <div style="padding: 15px; background-color: #ffffff; border-left: 4px solid #3498db; margin-top: 10px;">
                                    ${reply.replace(/\n/g, '<br>')}
                                </div>
                            </div>

                            <p>Nếu bạn có thêm câu hỏi, vui lòng liên hệ lại với chúng tôi.</p>

                            <p style="color: #7f8c8d; font-size: 0.9em;">
                                Trân trọng,<br>
                                Đội ngũ hỗ trợ AlexNguyen's Team
                            </p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);

                return NextResponse.json({
                    success: true,
                    message: 'Cập nhật liên hệ và gửi email thành công'
                });

            } catch (emailError) {
                console.error('Email sending error:', emailError);
                return NextResponse.json({
                    success: true,
                    message: 'Cập nhật liên hệ thành công nhưng không thể gửi email',
                    emailError: true
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Cập nhật liên hệ thành công'
        });

    } catch (error) {
        console.error('Error updating contact:', error);
        return NextResponse.json({
            success: false,
            message: 'Không thể cập nhật liên hệ'
        }, { status: 500 });
    }
}

// DELETE - Xóa contact
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check admin authentication
        const authResult = await requireAuth(request, 'admin');
        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                message: authResult.message
            }, { status: authResult.status });
        }

        const { id } = await params;

        // Check if contact exists
        const contacts = await query(
            'SELECT id_contact FROM contact WHERE id_contact = ?',
            [id]
        );

        if ((contacts as any[]).length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy liên hệ'
            }, { status: 404 });
        }

        // Delete contact
        await query('DELETE FROM contact WHERE id_contact = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Xóa liên hệ thành công'
        });

    } catch (error) {
        console.error('Error deleting contact:', error);
        return NextResponse.json({
            success: false,
            message: 'Không thể xóa liên hệ'
        }, { status: 500 });
    }
}
