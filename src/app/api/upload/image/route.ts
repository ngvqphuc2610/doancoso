import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Valid upload types
const VALID_TYPES = ['movies', 'products', 'entertainment', 'memberships'] as const;
type UploadType = typeof VALID_TYPES[number];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = (formData.get('type') as string) || 'movies'; // Default to movies for backward compatibility

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'Không có file được upload' },
                { status: 400 }
            );
        }

        // Validate upload type
        if (!VALID_TYPES.includes(type as UploadType)) {
            return NextResponse.json(
                { success: false, message: `Loại upload không hợp lệ. Chỉ chấp nhận: ${VALID_TYPES.join(', ')}` },
                { status: 400 }
            );
        }

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: 'File phải là ảnh (jpg, png, gif, etc.)' },
                { status: 400 }
            );
        }

        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: 'Kích thước file không được vượt quá 5MB' },
                { status: 400 }
            );
        }

        // Tạo tên file unique
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${originalName}`;

        // Tạo thư mục uploads theo type
        const uploadsDir = join(process.cwd(), 'public', 'uploads', type);
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Lưu file
        const filePath = join(uploadsDir, fileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Trả về URL của ảnh
        const imageUrl = `/uploads/${type}/${fileName}`;

        return NextResponse.json({
            success: true,
            message: 'Upload ảnh thành công',
            url: imageUrl,
            fileName: fileName,
            type: type
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: `Lỗi khi upload ảnh: ${error.message}` },
            { status: 500 }
        );
    }
}
