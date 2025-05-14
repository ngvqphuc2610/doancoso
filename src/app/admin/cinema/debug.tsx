"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, apiConfig } from '@/lib/apiUtils';

export default function DebugCinemaPage() {
    const [apiUrl, setApiUrl] = useState<string>('');
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // Hiển thị NEXT_PUBLIC_API_URL từ biến môi trường
        setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'Không được cấu hình');
    }, []);

    const testDirectApi = async () => {
        setLoading(true);
        setError(null);
        try {
            // Gọi trực tiếp API với URL cụ thể
            const response = await axios.get('http://localhost:5000/api/admin/cinema', {
                ...apiConfig,
                timeout: 5000
            });
            setApiResponse(response.data);
        } catch (err: any) {
            console.error('Lỗi khi gọi API trực tiếp:', err);
            setError(err.message || 'Lỗi không xác định khi gọi API trực tiếp');
        } finally {
            setLoading(false);
        }
    };

    const testConfiguredApi = async () => {
        setLoading(true);
        setError(null);
        try {
            // Gọi API thông qua utility function
            const url = getApiUrl('/api/admin/cinema');
            console.log('Gọi API tại:', url);
            const response = await axios.get(url, apiConfig);
            setApiResponse(response.data);
        } catch (err: any) {
            console.error('Lỗi khi gọi API qua cấu hình:', err);
            setError(err.message || 'Lỗi không xác định khi gọi API qua cấu hình');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Debug API Connection</h1>

            <div className="mb-6 p-4 bg-gray-100 rounded">
                <h2 className="text-xl mb-2">Thông tin cấu hình API:</h2>
                <p><strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl}</p>
                <p><strong>URL từ utility function:</strong> {getApiUrl('/api/admin/cinema')}</p>
            </div>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={testDirectApi}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    Test API trực tiếp (localhost:5000)
                </button>
                <button
                    onClick={testConfiguredApi}
                    className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    Test API qua cấu hình
                </button>
            </div>

            {loading && <p className="text-blue-500">Đang tải...</p>}

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
                    <h3 className="font-bold">Lỗi:</h3>
                    <p>{error}</p>
                </div>
            )}

            {apiResponse && (
                <div className="mt-4">
                    <h3 className="text-xl mb-2">Kết quả API:</h3>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
