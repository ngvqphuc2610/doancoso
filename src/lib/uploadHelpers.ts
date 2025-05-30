/**
 * Helper functions for file uploads
 */

export type UploadType = 'movies' | 'products' | 'entertainment';

export interface UploadResponse {
    success: boolean;
    message?: string;
    url?: string;
    fileName?: string;
    type?: string;
}

/**
 * Upload an image file to the server
 * @param file - The file to upload
 * @param type - The upload type (movies, products, entertainment)
 * @returns Promise with upload response
 */
export async function uploadImage(file: File, type: UploadType): Promise<UploadResponse> {
    try {
        // Client-side validation
        if (!file.type.startsWith('image/')) {
            return {
                success: false,
                message: 'Vui lòng chọn file ảnh (jpg, png, gif, etc.)'
            };
        }

        if (file.size > 5 * 1024 * 1024) {
            return {
                success: false,
                message: 'Kích thước file không được vượt quá 5MB'
            };
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        // Upload to server
        const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Lỗi khi upload ảnh'
            };
        }

        return data;

    } catch (error: any) {
        console.error('Upload error:', error);
        return {
            success: false,
            message: `Lỗi khi upload ảnh: ${error.message}`
        };
    }
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; message?: string } {
    if (!file.type.startsWith('image/')) {
        return {
            valid: false,
            message: 'Vui lòng chọn file ảnh (jpg, png, gif, etc.)'
        };
    }

    if (file.size > 5 * 1024 * 1024) {
        return {
            valid: false,
            message: 'Kích thước file không được vượt quá 5MB'
        };
    }

    return { valid: true };
}

/**
 * Get the appropriate upload directory for a given type
 * @param type - The upload type
 * @returns Directory path
 */
export function getUploadDirectory(type: UploadType): string {
    return `/uploads/${type}`;
}

/**
 * Generate a unique filename
 * @param originalName - Original filename
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${timestamp}_${sanitizedName}`;
}
