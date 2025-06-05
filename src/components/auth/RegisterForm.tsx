'use client';

import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullname: '',
    birthday: '',
    phone: '',
    username: '',
    cmnd: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Clear general message
    if (message) setMessage('');
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreeToTerms(e.target.checked);

    // Clear terms error when user checks the box
    if (e.target.checked && errors.terms) {
      setErrors({
        ...errors,
        terms: ''
      });
    }

    // Clear general message
    if (message) setMessage('');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Họ và tên là bắt buộc';
    }

    if (!formData.birthday) {
      newErrors.birthday = 'Ngày sinh là bắt buộc';
    } else {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.birthday = 'Bạn phải từ 13 tuổi trở lên';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.cmnd.trim()) {
      newErrors.cmnd = 'CCCD/CMND là bắt buộc';
    } else if (formData.cmnd.length < 9) {
      newErrors.cmnd = 'CCCD/CMND không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      newErrors.terms = 'Bạn phải đồng ý với các điều khoản và điều kiện';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      const result = await register(formData);
      if (result.success) {
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        // Reset form
        setFormData({
          fullname: '',
          birthday: '',
          phone: '',
          username: '',
          cmnd: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setAgreeToTerms(false);
        if (onSuccess) onSuccess();
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-dark">
      {/* Message display */}
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('thành công')
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
          }`}>
          {message}
        </div>
      )}

      <div>
        <label htmlFor="fullname" className="block text-sm font-medium mb-2">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="fullname"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullname ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Nhập họ và tên"
        />
        {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
      </div>

      <div>
        <label htmlFor="birthday" className="block text-sm font-medium mb-2">
          Ngày sinh <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="birthday"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.birthday ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {errors.birthday && <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Nhập số điện thoại"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-2">
          Tên đăng nhập <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Nhập tên đăng nhập"
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div>
        <label htmlFor="cmnd" className="block text-sm font-medium mb-2">
          CCCD/CMND <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="cmnd"
          name="cmnd"
          value={formData.cmnd}
          onChange={handleChange}
          className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cmnd ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Nhập số CCCD/CMND"
        />
        {errors.cmnd && <p className="text-red-500 text-sm mt-1">{errors.cmnd}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Nhập email"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Nhập mật khẩu"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Nhập lại mật khẩu"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreeToTerms}
            onChange={handleTermsChange}
            className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded cursor-pointer ${errors.terms ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
          <label htmlFor="terms" className="block text-sm text-gray-700 cursor-pointer">
            Tôi đồng ý với{' '}
            <a
              href="#"
              target="_blank"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              các điều khoản và điều kiện
            </a>{' '}
            của CineStar <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
      </div>


      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-black py-3 px-4 rounded font-bold hover:bg-yellow-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}
      </button>

      <div className='flex justify-center'>
        <label>Bạn đã có tài khoản?<a href="/login" className="text-blue-600 hover:text-blue-800 underline"> Đăng nhập ngay!</a></label>

      </div>
    </form>
  );
}
