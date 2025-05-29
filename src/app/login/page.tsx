"use client";
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleRegisterSuccess = () => {
    // Switch to login form after successful registration
    setIsLogin(true);
  };

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
              <LoginForm />
            ) : (
              <RegisterForm onSuccess={handleRegisterSuccess} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
