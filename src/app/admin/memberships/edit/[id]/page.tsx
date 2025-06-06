'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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

interface EditMembershipPageProps {
    params: Promise<{ id: string }>;
}

export default function EditMembershipPage({ params }: EditMembershipPageProps) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

    // Fetch membership data
    useEffect(() => {

        const fetchMembership = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/admin/memberships/${id}`);
                const data = await response.json();

                if (data.success) {
                    const membership = data.data;
                    setFormData({
                        code: membership.code || '',
                        title: membership.title || '',
                        image: membership.image || '',
                        link: membership.link || '',
                        description: membership.description || '',
                        benefits: membership.benefits || '',
                        criteria: membership.criteria || '',
                        status: membership.status || 'active'
                    });
                } else {
                    toast.error(data.message || 'Không tìm thấy gói thành viên');
                    router.push('/admin/memberships');
                }
            } catch (error) {
                console.error('Error fetching membership:', error);
                toast.error('Lỗi khi tải dữ liệu');
                router.push('/admin/memberships');
            } finally {
                setLoading(false);
            }
        };

        fetchMembership();
    }, [id, router]);

    // Handle form input changes
    const handleInputChange = (field: keyof MembershipForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.title) {
            toast.error('Vui lòng nhập mã và tên gói thành viên');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`/api/admin/memberships/${id}`, {
                method: 'PUT',
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
                toast.error(data.message || 'Lỗi khi cập nhật gói thành viên');
            }
        } catch (error) {
            console.error('Error updating membership:', error);
            toast.error('Lỗi khi cập nhật gói thành viên');
        } finally {
            setSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/admin/memberships/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                router.push('/admin/memberships');
            } else {
                toast.error(data.message || 'Lỗi khi xóa gói thành viên');
            }
        } catch (error) {
            console.error('Error deleting membership:', error);
            toast.error('Lỗi khi xóa gói thành viên');
        }
        setShowDeleteDialog(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/memberships">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa gói thành viên</h1>
                        <p className="text-gray-600 mt-2">Cập nhật thông tin gói thành viên</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 hover:text-red-700"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                </Button>
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
                                        disabled={saving}
                                        className="w-full"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Đang cập nhật...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Cập nhật gói thành viên
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa gói thành viên này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}