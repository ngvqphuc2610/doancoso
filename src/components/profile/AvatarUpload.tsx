'use client';

import React, { useState, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Camera, Upload, User, X } from 'lucide-react';

interface AvatarUploadProps {
    profile: any;
}

export default function AvatarUpload({ profile }: AvatarUploadProps) {
    const { uploadAvatar } = useProfile();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setMessage('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setMessage('File ảnh không được vượt quá 5MB');
            return;
        }

        setSelectedFile(file);
        setMessage('');

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Vui lòng chọn file ảnh');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await uploadAvatar(selectedFile);
            
            if (result.success) {
                setMessage('Upload ảnh đại diện thành công!');
                setPreview(null);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            setMessage('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setPreview(null);
        setSelectedFile(null);
        setMessage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <div className="flex items-center mb-6">
                <Camera className="w-6 h-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Ảnh đại diện</h2>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.includes('thành công') 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {message}
                </div>
            )}

            <div className="flex flex-col items-center space-y-6">
                {/* Current Avatar */}
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Ảnh hiện tại</h3>
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto">
                        {profile?.profileImage ? (
                            <img
                                src={profile.profileImage}
                                alt="Current Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16 text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Preview */}
                {preview && (
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Xem trước</h3>
                        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* File Input */}
                <div className="w-full max-w-md">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    
                    {!selectedFile ? (
                        <button
                            onClick={triggerFileInput}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600">Chọn ảnh từ máy tính</span>
                        </button>
                    ) : (
                        <div className="space-y-4">
                            {/* Selected file info */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCancel}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>{loading ? 'Đang upload...' : 'Upload ảnh'}</span>
                                </button>
                                <button
                                    onClick={triggerFileInput}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Chọn khác
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload guidelines */}
                <div className="w-full max-w-md p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Yêu cầu ảnh:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Định dạng: JPEG, PNG, GIF</li>
                        <li>• Kích thước tối đa: 5MB</li>
                        <li>• Khuyến nghị: Ảnh vuông, tỷ lệ 1:1</li>
                        <li>• Độ phân giải tối thiểu: 200x200 pixels</li>
                    </ul>
                </div>

                {/* Tips */}
                <div className="w-full max-w-md p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Mẹo chụp ảnh đẹp:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Sử dụng ánh sáng tự nhiên</li>
                        <li>• Đảm bảo khuôn mặt rõ nét</li>
                        <li>• Tránh chụp ngược sáng</li>
                        <li>• Giữ camera ở tầm mắt</li>
                        <li>• Nền đơn giản, không rối mắt</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
