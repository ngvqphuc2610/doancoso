'use client';

import { useState } from 'react';
import BannerForm from '@/components/admin/BannerForm';
import BannerList from '@/components/admin/BannerList';
import { HomepageBanner } from '@/app/api/admin/banners/route';

export default function BannerManagementPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddNew = () => {
        setEditingBanner(null);
        setShowForm(true);
        setMessage(null);
    };

    const handleEdit = (banner: HomepageBanner) => {
        setEditingBanner(banner);
        setShowForm(true);
        setMessage(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingBanner(null);
        setMessage(null);
    };

    const handleSubmit = async (formData: any) => {
        setLoading(true);
        setMessage(null);

        try {
            const url = '/api/admin/banners';
            const method = editingBanner ? 'PUT' : 'POST';
            const body = editingBanner
                ? { ...formData, id_banner: editingBanner.id_banner }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: editingBanner ? 'Banner đã được cập nhật thành công!' : 'Banner đã được tạo thành công!'
                });
                setShowForm(false);
                setEditingBanner(null);
                setRefreshTrigger(prev => prev + 1); // Trigger refresh
            } else {
                setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: `Lỗi: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/banners?id=${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Banner đã được xóa thành công!' });
                setRefreshTrigger(prev => prev + 1); // Trigger refresh
            } else {
                setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra khi xóa banner' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: `Lỗi: ${error.message}` });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-dark">Quản lý Banner Trang Chủ</h1>
                {!showForm && (
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Thêm Banner Mới
                    </button>
                )}
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded ${message.type === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Form hoặc List */}
            {showForm ? (
                <BannerForm
                    banner={editingBanner || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                />
            ) : (
                <div className="space-y-6">
                   

                    <BannerList
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            )}
        </div>
    );
}
