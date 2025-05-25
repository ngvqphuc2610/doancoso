import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);    // Generate a unique filename using timestamp
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `product_${timestamp}${fileExtension}`;

    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Return the absolute URL
    return NextResponse.json({
        url: `/uploads/${uniqueFilename}`,
        originalName: file.name
    });
}