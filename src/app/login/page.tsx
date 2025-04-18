"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Layout>
      <div
        className="flex min-h-screen"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(17, 24, 39, 0.9)), url("/images/background_heeder.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="w-full max-w-md mx-auto">
          <div className="mt-10 bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-between mb-8">
              <button
                className={`text-2xl font-bold ${isLogin ? 'text-black' : 'text-gray-400'}`}
                onClick={() => setIsLogin(true)}
              >
                ĐĂNG NHẬP
              </button>
              <button
                className={`text-2xl font-bold ${!isLogin ? 'text-black' : 'text-gray-400'}`}
                onClick={() => setIsLogin(false)}
              >
                ĐĂNG KÝ
              </button>
            </div>

            {isLogin ? (
              // FORM ĐĂNG NHẬP
              <form className="space-y-6 text-dark">
                <div>
                  <label htmlFor="account" className="block text-sm font-medium mb-2">
                    Tài khoản, Email hoặc số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="account"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="login-password"
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-login"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-login" className="ml-2 block text-sm text-gray-700">
                    Lưu mật khẩu đăng nhập
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-400 text-black py-3 px-4 rounded font-bold hover:bg-yellow-500 transition duration-200"
                >
                  ĐĂNG NHẬP
                </button>

                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
              </form>
            ) : (
              // FORM ĐĂNG KÝ
              <form className="space-y-6 text-dark">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    placeholder="Họ và tên"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Số điện thoại"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Tên đăng nhập"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cmnd" className="block text-sm font-medium mb-2">
                    CCCD/CMND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="cmnd"
                    placeholder="Số CCCD/CMND"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Điền Email"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      id="register-password"
                      placeholder="Mật khẩu"
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                    Xác thực mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-password"
                      placeholder="Xác thực mật khẩu"
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    required
                  />
                  <label htmlFor="terms" className="block text-sm text-gray-700">
                    Khách hàng đã đồng ý các điều khoản, điều kiện của thành viên Cinestar
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-400 text-black py-3 px-4 rounded font-bold hover:bg-yellow-500 transition duration-200"
                >
                  ĐĂNG KÝ
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
