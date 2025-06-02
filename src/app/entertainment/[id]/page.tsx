import { Entertainment } from '@/lib/types/database';
import { query } from '@/lib/db';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, User, Eye, Star } from 'lucide-react';

async function getEntertainment(id: string): Promise<Entertainment | null> {
    try {
        const entertainments = await query<Entertainment[]>(
            `SELECT
                e.*,
                c.cinema_name,
                c.address as cinema_address,
                c.city as cinema_city,
                s.staff_name
            FROM entertainment e
            LEFT JOIN cinemas c ON e.id_cinema = c.id_cinema
            LEFT JOIN staff s ON e.id_staff = s.id_staff
            WHERE e.id_entertainment = ? AND e.status = 'active'`,
            [parseInt(id)]
        );

        if (!entertainments.length) return null;

        return entertainments[0];
    } catch (error) {
        console.error("Lỗi khi lấy thông tin giải trí:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const entertainment = await getEntertainment(id);

    if (!entertainment) {
        return {
            title: 'Không tìm thấy giải trí',
            description: 'Thông tin giải trí không tồn tại'
        };
    }

    return {
        title: `${entertainment.title} - CineStar Entertainment`,
        description: entertainment.description || `Thông tin chi tiết về ${entertainment.title}`,
        openGraph: {
            title: entertainment.title,
            description: entertainment.description || '',
            images: entertainment.image_url ? [entertainment.image_url] : [],
        },
    };
}

export default async function EntertainmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const entertainment = await getEntertainment(id);

    if (!entertainment) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Không tìm thấy thông tin giải trí</p>
                    <a
                        href="/"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Về trang chủ
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-96 bg-gradient-to-r from-blue-900 to-purple-900">
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="relative container mx-auto px-4 h-full flex items-center">
                    <div className="text-white">
                        <h1 className="text-5xl font-bold mb-4">{entertainment.title}</h1>
                        <div className="flex items-center space-x-4 text-lg">
                            <span className="px-3 py-1 rounded-full bg-green-500">
                                Đang diễn ra
                            </span>
                            {entertainment.featured && (
                                <span className="flex items-center bg-yellow-500 px-3 py-1 rounded-full">
                                    <Star className="w-4 h-4 mr-1" />
                                    Nổi bật
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Image */}
                        <div className="mb-8">
                            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                                <Image
                                    src={entertainment.image_url || '/images/no-image.jpg'}
                                    alt={entertainment.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                            <h2 className="text-3xl font-bold mb-6 text-gray-800">Mô tả</h2>
                            <div className="prose prose-lg max-w-none text-gray-600">
                                {entertainment.description ? (
                                    <p className="leading-relaxed">{entertainment.description}</p>
                                ) : (
                                    <p className="text-gray-400 italic">Chưa có mô tả chi tiết</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                            <h3 className="text-2xl font-bold mb-6 text-gray-800">Thông tin chi tiết</h3>

                            <div className="space-y-4">
                        
                                {/* Cinema */}
                                {entertainment.cinema_name && (
                                    <div className="flex items-center">
                                        <MapPin className="w-5 h-5 text-green-500 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Địa điểm</p>
                                            <p className="font-semibold">{entertainment.cinema_name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Views */}
                               
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 space-y-3">
                                <Link
                                    href="/"
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                                >
                                    Về trang chủ
                                </Link>
                                <Link
                                    href="/entertainment"
                                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center block"
                                >
                                    Xem thêm giải trí
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}