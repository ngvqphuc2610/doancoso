import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/config/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST - Upload avatar
export async function POST(req: NextRequest) {
    try {
        // Get token from cookie
        const token = req.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy token xác thực'
            }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.userId;

        const formData = await req.formData();
        const file = formData.get('avatar') as File;

        if (!file) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy file ảnh'
            }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                success: false,
                message: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)'
            }, { status: 400 });
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                message: 'File ảnh không được vượt quá 5MB'
            }, { status: 400 });
        }

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(file.name);
        const fileName = `${userId}_${timestamp}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Update user profile image in database
        const profileImageUrl = `/uploads/avatars/${fileName}`;
        await query(
            'UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id_users = ?',
            [profileImageUrl, userId]
        );

        return NextResponse.json({
            success: true,
            message: 'Upload ảnh đại diện thành công',
            data: {
                profileImage: profileImageUrl
            }
        });

    } catch (error) {
        console.error('Error uploading avatar:', error);
        return NextResponse.json({
            success: false,
            message: 'Lỗi server khi upload ảnh'
        }, { status: 500 });
    }
}
