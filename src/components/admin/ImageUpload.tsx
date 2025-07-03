'use client';

import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    uploadEndpoint?: string;
    disabled?: boolean;
}

export default function ImageUpload({
    label,
    value,
    onChange,
    placeholder = "URL hình ảnh hoặc upload từ máy",
    uploadEndpoint = '/api/admin/memberships/upload',
    disabled = false
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File quá lớn. Kích thước tối đa là 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                onChange(data.data.url);
                toast.success('Upload ảnh thành công!');
            } else {
                toast.error(data.message || 'Lỗi khi upload ảnh');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi khi upload ảnh');
        } finally {
            setUploading(false);
            // Reset input value để có thể upload lại cùng file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClearImage = () => {
        onChange('');
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            
            {/* URL Input và Upload Button */}
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || uploading}
                    className="flex-1"
                />
                
                <Button
                    type="button"
                    variant="custom8"
                    size="sm"
                    onClick={handleFileSelect}
                    disabled={disabled || uploading}
                    className="px-3"
                >
                    {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                </Button>

                {value && (
                    <Button
                        type="button"
                        variant="custom8"
                        size="sm"
                        onClick={handleClearImage}
                        disabled={disabled || uploading}
                        className="px-3"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || uploading}
            />

            {/* Help Text */}
            <p className="text-xs text-gray-500">
                Chấp nhận: JPEG, PNG, GIF, WebP. Tối đa 5MB
            </p>

            {/* Preview */}
            {value && (
                <div className="mt-2">
                    <div className="border rounded-lg overflow-hidden w-full max-w-xs">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/images/no-image.jpg';
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
