'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';

export default function ChangePassword() {
    const { changePassword } = useProfile();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate form
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage('Vui lòng điền đầy đủ thông tin');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setMessage('Mật khẩu mới phải khác mật khẩu hiện tại');
            setLoading(false);
            return;
        }

        try {
            const result = await changePassword(formData);
            
            if (result.success) {
                setMessage('Đổi mật khẩu thành công!');
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setMessage(''), 5000);
            } else {
                setMessage(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            setMessage('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Đổi mật khẩu</h2>
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

            <form onSubmit={handleSubmit} className="max-w-md text-dark">
                {/* Mật khẩu hiện tại */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại *
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.current ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.current ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới *
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.new ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Mật khẩu phải có ít nhất 6 ký tự
                    </p>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới *
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.confirm ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Password strength indicator */}
                {formData.newPassword && (
                    <div className="mb-6">
                        <div className="text-sm text-gray-600 mb-2">Độ mạnh mật khẩu:</div>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4].map((level) => {
                                let strength = 0;
                                if (formData.newPassword.length >= 6) strength++;
                                if (formData.newPassword.length >= 8) strength++;
                                if (/[A-Z]/.test(formData.newPassword)) strength++;
                                if (/[0-9]/.test(formData.newPassword)) strength++;
                                if (/[^A-Za-z0-9]/.test(formData.newPassword)) strength++;

                                return (
                                    <div
                                        key={level}
                                        className={`h-2 w-full rounded ${
                                            level <= strength
                                                ? strength <= 2
                                                    ? 'bg-red-400'
                                                    : strength <= 3
                                                    ? 'bg-yellow-400'
                                                    : 'bg-green-400'
                                                : 'bg-gray-200'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {formData.newPassword.length < 6 && 'Quá ngắn'}
                            {formData.newPassword.length >= 6 && formData.newPassword.length < 8 && 'Yếu'}
                            {formData.newPassword.length >= 8 && !/[A-Z]/.test(formData.newPassword) && 'Trung bình'}
                            {formData.newPassword.length >= 8 && /[A-Z]/.test(formData.newPassword) && !/[0-9]/.test(formData.newPassword) && 'Khá mạnh'}
                            {formData.newPassword.length >= 8 && /[A-Z]/.test(formData.newPassword) && /[0-9]/.test(formData.newPassword) && 'Mạnh'}
                        </div>
                    </div>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</span>
                </button>
            </form>

            {/* Security tips */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Lời khuyên bảo mật:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sử dụng mật khẩu có ít nhất 8 ký tự</li>
                    <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                    <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
                    <li>• Không chia sẻ mật khẩu với người khác</li>
                    <li>• Thay đổi mật khẩu định kỳ</li>
                </ul>
            </div>
        </div>
    );
}
