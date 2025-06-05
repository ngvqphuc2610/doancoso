'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Save, Edit, X } from 'lucide-react';

interface ProfileInfoProps {
    profile: any;
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
    const { updateProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        fullName: profile?.fullName || '',
        phone: profile?.phone || '',
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile?.gender || '',
        address: profile?.address || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const result = await updateProfile(formData);
            
            if (result.success) {
                setMessage('Cập nhật thông tin thành công!');
                setIsEditing(false);
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
        setFormData({
            fullName: profile?.fullName || '',
            phone: profile?.phone || '',
            dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
            gender: profile?.gender || '',
            address: profile?.address || ''
        });
        setIsEditing(false);
        setMessage('');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span>Hủy</span>
                        </button>
                    </div>
                )}
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                    message.includes('thành công') 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-dark">
                    {/* Họ và tên */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên *
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập họ và tên"
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                                {profile?.fullName || 'Chưa cập nhật'}
                            </div>
                        )}
                    </div>

                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                            {profile?.email}
                        </div>
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số điện thoại"
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                                {profile?.phone || 'Chưa cập nhật'}
                            </div>
                        )}
                    </div>

                    {/* Ngày sinh */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày sinh
                        </label>
                        {isEditing ? (
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                                {profile?.dateOfBirth 
                                    ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')
                                    : 'Chưa cập nhật'
                                }
                            </div>
                        )}
                    </div>

                    {/* Giới tính */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới tính
                        </label>
                        {isEditing ? (
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                                {profile?.gender === 'male' ? 'Nam' : 
                                 profile?.gender === 'female' ? 'Nữ' : 
                                 profile?.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
                            </div>
                        )}
                    </div>

                    {/* Username (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên đăng nhập
                        </label>
                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                            {profile?.username}
                        </div>
                    </div>
                </div>

                {/* Địa chỉ */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                    </label>
                    {isEditing ? (
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập địa chỉ"
                        />
                    ) : (
                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[80px]">
                            {profile?.address || 'Chưa cập nhật'}
                        </div>
                    )}
                </div>

                {/* Member info */}
                {profile?.member && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Thông tin thành viên</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-blue-700">Điểm tích lũy:</span>
                                <span className="ml-2 font-medium">{profile.member.points}</span>
                            </div>
                            <div>
                                <span className="text-blue-700">Loại thành viên:</span>
                                <span className="ml-2 font-medium">{profile.member.type || 'Cơ bản'}</span>
                            </div>
                            <div>
                                <span className="text-blue-700">Ngày tham gia:</span>
                                <span className="ml-2 font-medium">
                                    {new Date(profile.member.joinDate).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
