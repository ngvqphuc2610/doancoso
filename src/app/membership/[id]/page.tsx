import { Membership } from '@/lib/types/database';
import { query } from '@/lib/db';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Star, Gift, CheckCircle, Users, Crown, ArrowLeft } from 'lucide-react';

async function getMembership(id: string): Promise<Membership | null> {
    try {
        const memberships = await query<Membership[]>(
            `SELECT 
                m.*
            FROM membership m
            WHERE m.id_membership = ? AND m.status = 'active'`,
            [parseInt(id)]
        );

        if (!memberships.length) return null;

        return memberships[0];
    } catch (error) {
        console.error("Lỗi khi lấy thông tin gói thành viên:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const membership = await getMembership(id);

    if (!membership) {
        return {
            title: 'Không tìm thấy gói thành viên',
            description: 'Thông tin gói thành viên không tồn tại'
        };
    }

    return {
        title: `${membership.title} - CineStar Membership`,
        description: membership.description || `Thông tin chi tiết về gói thành viên ${membership.title}`,
        openGraph: {
            title: membership.title,
            description: membership.description || '',
            images: membership.image ? [membership.image] : [],
        },
    };
}

export default async function MembershipDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const membership = await getMembership(id);

    if (!membership) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                        <p className="text-xl text-gray-600 mb-8">Không tìm thấy thông tin gói thành viên</p>
                        <Link 
                            href="/membership" 
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Về trang gói thành viên
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    const getThemeColor = (title: string) => {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('đồng') || titleLower.includes('bronze')) {
            return {
                gradient: 'from-amber-600 to-amber-800',
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-800',
                accent: 'text-amber-600'
            };
        } else if (titleLower.includes('bạc') || titleLower.includes('silver')) {
            return {
                gradient: 'from-gray-400 to-gray-600',
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                text: 'text-gray-800',
                accent: 'text-gray-600'
            };
        } else if (titleLower.includes('vàng') || titleLower.includes('gold')) {
            return {
                gradient: 'from-yellow-400 to-yellow-600',
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                text: 'text-yellow-800',
                accent: 'text-yellow-600'
            };
        } else if (titleLower.includes('kim cương') || titleLower.includes('diamond')) {
            return {
                gradient: 'from-blue-400 to-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                accent: 'text-blue-600'
            };
        }
        return {
            gradient: 'from-blue-500 to-blue-700',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            accent: 'text-blue-600'
        };
    };

    const theme = getThemeColor(membership.title);
    const benefitsList = membership.benefits ? membership.benefits.split(',').map(b => b.trim()) : [];
    const criteriaList = membership.criteria ? membership.criteria.split(',').map(c => c.trim()) : [];

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className={`relative bg-gradient-to-r ${theme.gradient} text-white py-20`}>
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative container mx-auto px-4">
                        {/* Back button */}
                        <Link 
                            href="/membership"
                            className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại danh sách gói thành viên
                        </Link>

                        <div className="text-center">
                            <div className="mb-4">
                                <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-lg font-medium">
                                    {membership.code}
                                </span>
                            </div>
                            <Crown className="w-20 h-20 mx-auto mb-6" />
                            <h1 className="text-6xl font-bold mb-4">{membership.title}</h1>
                            {membership.description && (
                                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                                    {membership.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Benefits */}
                            {benefitsList.length > 0 && (
                                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                                    <div className="flex items-center mb-6">
                                        <Gift className={`w-8 h-8 ${theme.accent} mr-3`} />
                                        <h2 className="text-3xl font-bold text-gray-800">Quyền lợi thành viên</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {benefitsList.map((benefit, index) => (
                                            <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                                                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700 leading-relaxed">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Criteria */}
                            {criteriaList.length > 0 && (
                                <div className="bg-white rounded-lg shadow-lg p-8">
                                    <div className="flex items-center mb-6">
                                        <Users className={`w-8 h-8 ${theme.accent} mr-3`} />
                                        <h2 className="text-3xl font-bold text-gray-800">Điều kiện tham gia</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {criteriaList.map((criteria, index) => (
                                            <div key={index} className="flex items-start p-4 border-l-4 border-blue-500 bg-blue-50">
                                                <span className="text-blue-800 font-medium mr-3">{index + 1}.</span>
                                                <span className="text-blue-700 leading-relaxed">{criteria}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className={`${theme.bg} ${theme.border} border-2 rounded-lg shadow-lg p-6 sticky top-6`}>
                                <div className="text-center mb-6">
                                    <Star className={`w-16 h-16 mx-auto mb-4 ${theme.accent}`} />
                                    <h3 className={`text-2xl font-bold ${theme.text}`}>Đăng ký ngay</h3>
                                    <p className="text-gray-600 mt-2">Trở thành thành viên để nhận ưu đãi</p>
                                </div>

                                <div className="space-y-4">
                                    <button className={`w-full bg-gradient-to-r ${theme.gradient} text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-semibold`}>
                                        Đăng ký thành viên
                                    </button>
                                    
                                    <Link 
                                        href="/membership"
                                        className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors text-center block font-semibold"
                                    >
                                        Xem gói khác
                                    </Link>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-3">Liên hệ hỗ trợ</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>📞 Hotline: 1900-6017</p>
                                        <p>📧 Email: support@cinestar.com.vn</p>
                                        <p>🕒 Thời gian: 8:00 - 22:00 hàng ngày</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
