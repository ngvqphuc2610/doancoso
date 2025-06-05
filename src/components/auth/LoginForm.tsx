'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [rememberPassword, setRememberPassword] = useState(false);

  const { login } = useAuth();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      try {
        const { username, password, remember } = JSON.parse(savedCredentials);
        setFormData({ username, password });
        setRememberPassword(remember);
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear message when user starts typing
    if (message) setMessage('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setMessage('Vui lòng nhập tên đăng nhập hoặc email');
      return false;
    }
    if (!formData.password) {
      setMessage('Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        // Save credentials if remember password is checked
        if (rememberPassword) {
          const credentialsToSave = {
            username: formData.username,
            password: formData.password,
            remember: true
          };
          localStorage.setItem('savedCredentials', JSON.stringify(credentialsToSave));
        } else {
          // Remove saved credentials if remember is unchecked
          localStorage.removeItem('savedCredentials');
        }

        // AuthContext sẽ tự động chuyển hướng, không cần làm gì thêm
        if (onSuccess) onSuccess();
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-dark">
      {/* Message display */}
      {message && (
        <div className="p-3 rounded bg-red-100 text-red-700 text-sm">
          {message}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-2">
          Tài khoản, Email hoặc số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tên đăng nhập, email hoặc số điện thoại"
          required
        />
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
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mật khẩu"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          checked={rememberPassword}
          onChange={(e) => setRememberPassword(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        />
        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
          Lưu mật khẩu đăng nhập
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-black py-3 px-4 rounded font-bold hover:bg-yellow-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
      </button>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>
    </form>
  );
}
