'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

interface MembershipForm {
    code: string;
    title: string;
    image: string;
    link: string;
    description: string;
    benefits: string;
    criteria: string;
    status: 'active' | 'inactive';
}

export default function CreateMembershipPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<MembershipForm>({
        code: '',
        title: '',
        image: '',
        link: '',
        description: '',
        benefits: '',
        criteria: '',
        status: 'active'
    });

    // Handle form input changes
    const handleInputChange = (field: keyof MembershipForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };



    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.title) {
            toast.error('Vui lòng nhập mã và tên gói thành viên');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/admin/memberships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                router.push('/admin/memberships');
            } else {
                toast.error(data.message || 'Lỗi khi tạo gói thành viên');
            }
        } catch (error) {
            console.error('Error creating membership:', error);
            toast.error('Lỗi khi tạo gói thành viên');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/memberships">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tạo gói thành viên mới</h1>
                    <p className="text-gray-600 mt-2">Thêm gói thành viên mới vào hệ thống</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cơ bản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="code">Mã gói *</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) => handleInputChange('code', e.target.value)}
                                            placeholder="VD: GOLD, SILVER, BRONZE"
                                            className="uppercase"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="title">Tên gói *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            placeholder="VD: Thành viên Vàng"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Mô tả về gói thành viên..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <ImageUpload
                                            label="Hình ảnh"
                                            value={formData.image}
                                            onChange={(value) => handleInputChange('image', value)}
                                            uploadEndpoint="/api/admin/memberships/upload"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="link">Link tùy chỉnh</Label>
                                        <Input
                                            id="link"
                                            value={formData.link}
                                            onChange={(e) => handleInputChange('link', e.target.value)}
                                            placeholder="/membership/special-page"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Benefits & Criteria */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quyền lợi & Điều kiện</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="benefits">Quyền lợi</Label>
                                    <Textarea
                                        id="benefits"
                                        value={formData.benefits}
                                        onChange={(e) => handleInputChange('benefits', e.target.value)}
                                        placeholder="Giảm giá 15%, Tích điểm x3, Miễn phí combo, ..."
                                        rows={4}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Mỗi quyền lợi cách nhau bằng dấu phẩy
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="criteria">Điều kiện</Label>
                                    <Textarea
                                        id="criteria"
                                        value={formData.criteria}
                                        onChange={(e) => handleInputChange('criteria', e.target.value)}
                                        placeholder="Chi tiêu tối thiểu 1.000.000 VNĐ/tháng, Thành viên ít nhất 6 tháng, ..."
                                        rows={4}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Mỗi điều kiện cách nhau bằng dấu phẩy
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: 'active' | 'inactive') =>
                                            handleInputChange('status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Hoạt động</SelectItem>
                                            <SelectItem value="inactive">Không hoạt động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Preview */}
                                {formData.image && (
                                    <div>
                                        <Label>Xem trước hình ảnh</Label>
                                        <div className="mt-2 border rounded-lg overflow-hidden">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-32 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/no-image.jpg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="space-y-2 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Tạo gói thành viên
                                            </>
                                        )}
                                    </Button>
                                    <Link href="/admin/memberships" className="block">
                                        <Button type="button" variant="ghost" className="w-full">
                                            Hủy
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
