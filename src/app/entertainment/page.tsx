'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Entertainment } from '@/lib/types/database';
import { Calendar, MapPin, Eye, Star, Search } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EntertainmentPage() {
    const [entertainments, setEntertainments] = useState<Entertainment[]>([]);
    const [filteredEntertainments, setFilteredEntertainments] = useState<Entertainment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'featured' | 'active'>('all');

    useEffect(() => {
        const fetchEntertainments = async () => {
            try {
                const response = await fetch('/api/entertainment');
                const data = await response.json();

                if (data.success) {
                    setEntertainments(data.data);
                    setFilteredEntertainments(data.data);
                }
            } catch (error) {
                console.error('Error fetching entertainments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntertainments();
    }, []);

    useEffect(() => {
        let filtered = entertainments;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(entertainment =>
                entertainment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entertainment.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (filter === 'featured') {
            filtered = filtered.filter(entertainment => entertainment.featured);
        } else if (filter === 'active') {
            const now = new Date();
            filtered = filtered.filter(entertainment => {
                const startDate = new Date(entertainment.start_date);
                const endDate = entertainment.end_date ? new Date(entertainment.end_date) : null;
                return now >= startDate && (!endDate || now <= endDate);
            });
        }

        setFilteredEntertainments(filtered);
    }, [entertainments, searchTerm, filter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isActive = (entertainment: Entertainment) => {
        const now = new Date();
        const startDate = new Date(entertainment.start_date);
        const endDate = entertainment.end_date ? new Date(entertainment.end_date) : null;

        return now >= startDate && (!endDate || now <= endDate);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl font-bold mb-4">Giải trí & Hoạt động</h1>
                    <p className="text-xl opacity-90">Khám phá các hoạt động giải trí thú vị tại CineStar</p>
                </div>
            </div>

            {/* Filters */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm giải trí..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as 'all' | 'featured' | 'active')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            <option value="featured">Nổi bật</option>
                            <option value="active">Đang diễn ra</option>
                        </select>
                    </div>
                </div>

                {/* Results */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        Hiển thị {filteredEntertainments.length} / {entertainments.length} hoạt động giải trí
                    </p>
                </div>

                {/* Entertainment Grid */}
                {filteredEntertainments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEntertainments.map((entertainment) => (
                            <Link
                                key={entertainment.id_entertainment}
                                href={`/entertainment/${entertainment.id_entertainment}`}
                                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="relative h-48">
                                    <Image
                                        src={entertainment.image_url || '/images/no-image.jpg'}
                                        alt={entertainment.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        {entertainment.featured && (
                                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                                                <Star className="w-3 h-3 mr-1" />
                                                Nổi bật
                                            </span>
                                        )}
                                        <span className={`px-2 py-1 rounded-full text-xs ${isActive(entertainment) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                            }`}>
                                            {isActive(entertainment) ? 'Đang diễn ra' : 'Sắp diễn ra'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 text-gray-800">{entertainment.title}</h3>
                                    <p className="text-gray-600 mb-4 overflow-hidden" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {entertainment.description || 'Không có mô tả'}
                                    </p>

                                    <div className="space-y-2 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>{formatDate(entertainment.start_date)}</span>
                                        </div>

                                        {entertainment.cinema_name && (
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                <span>{entertainment.cinema_name}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center">
                                            <Eye className="w-4 h-4 mr-2" />
                                            <span>{entertainment.views_count || 0} lượt xem</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-500">Không tìm thấy hoạt động giải trí nào</p>
                        <p className="text-gray-400 mt-2">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                    </div>
                )}
            </div>
        </div>
    );
}