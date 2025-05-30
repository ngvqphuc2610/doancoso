'use client';

import { useState, useEffect } from 'react';
import { HomepageBanner } from '@/app/api/admin/banners/route';

interface BannerListProps {
    onEdit: (banner: HomepageBanner) => void;
    onDelete: (id: number) => void;
    refreshTrigger?: number;
}

export default function BannerList({ onEdit, onDelete, refreshTrigger }: BannerListProps) {
    const [banners, setBanners] = useState<HomepageBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        fetchBanners();
    }, [refreshTrigger]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/banners');
            const data = await response.json();
            
            if (data.success) {
                setBanners(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (banner: HomepageBanner) => {
        try {
            const response = await fetch('/api/admin/banners', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...banner,
                    is_active: !banner.is_active
                })
            });

            if (response.ok) {
                fetchBanners(); // Refresh list
            }
        } catch (error) {
            console.error('Error toggling banner status:', error);
        }
    };

    const filteredBanners = banners.filter(banner => {
        if (filter === 'active') return banner.is_active;
        if (filter === 'inactive') return !banner.is_active;
        return true;
    });

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center py-8">
                    <div className="text-gray-500">Đang tải danh sách banner...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Danh sách Banner</h2>
                
                {/* Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded text-sm ${
                            filter === 'all' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Tất cả ({banners.length})
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-3 py-1 rounded text-sm ${
                            filter === 'active' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Đang hoạt động ({banners.filter(b => b.is_active).length})
                    </button>
                    <button
                        onClick={() => setFilter('inactive')}
                        className={`px-3 py-1 rounded text-sm ${
                            filter === 'inactive' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Không hoạt động ({banners.filter(b => !b.is_active).length})
                    </button>
                </div>
            </div>

            {filteredBanners.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500">
                        {filter === 'all' 
                            ? 'Chưa có banner nào được tạo' 
                            : `Không có banner ${filter === 'active' ? 'đang hoạt động' : 'không hoạt động'}`
                        }
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBanners.map((banner) => (
                        <div key={banner.id_banner} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-4">
                                {/* Preview Image */}
                                <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {banner.movie_banner ? (
                                        <img
                                            src={banner.movie_banner}
                                            alt={banner.movie_title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/movie-placeholder.jpg';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full relative">
                                            <div 
                                                className="absolute inset-0 w-full h-full"
                                                style={{
                                                    backgroundImage: `url(${banner.movie_poster || '/images/movie-placeholder.jpg'})`,
                                                    backgroundSize: '120%',
                                                    backgroundPosition: 'center 20%',
                                                    filter: 'blur(4px)',
                                                    transform: 'scale(1.1)'
                                                }}
                                            />
                                            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10">
                                                <img
                                                    src={banner.movie_poster || '/images/movie-placeholder.jpg'}
                                                    alt={banner.movie_title}
                                                    className="w-6 h-9 object-cover rounded shadow"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Banner Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg">{banner.title}</h3>
                                            <p className="text-gray-600">Phim: {banner.movie_title}</p>
                                            {banner.description && (
                                                <p className="text-gray-500 text-sm mt-1">{banner.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span>Thứ tự: {banner.display_order}</span>
                                                <span>
                                                    {banner.movie_banner 
                                                        ? '✅ Banner chuyên dụng' 
                                                        : '⚠️ Sử dụng poster'
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                banner.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {banner.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => onEdit(banner)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(banner)}
                                            className={`px-3 py-1 rounded text-sm ${
                                                banner.is_active
                                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                        >
                                            {banner.is_active ? 'Tắt' : 'Bật'}
                                        </button>
                                        <button
                                            onClick={() => onDelete(banner.id_banner)}
                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
