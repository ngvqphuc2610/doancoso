import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${originalName}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Write file to uploads directory
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, buffer);

        // Return the public URL
        const url = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            url: url,
            filename: filename,
            size: file.size,
            type: file.type
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Upload failed' },
            { status: 500 }
        );
    }
}

// GET method to list uploaded files (optional)
export async function GET() {
    try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        
        if (!existsSync(uploadsDir)) {
            return NextResponse.json({
                success: true,
                files: []
            });
        }

        const fs = require('fs');
        const files = fs.readdirSync(uploadsDir);
        
        const fileList = files.map((filename: string) => ({
            filename,
            url: `/uploads/${filename}`,
            path: join(uploadsDir, filename)
        }));

        return NextResponse.json({
            success: true,
            files: fileList
        });

    } catch (error) {
        console.error('Error listing files:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list files' },
            { status: 500 }
        );
    }
}
