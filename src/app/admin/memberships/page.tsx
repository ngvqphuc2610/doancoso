'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

interface Membership {
    id_membership: number;
    code: string;
    title: string;
    image?: string;
    link?: string;
    description?: string;
    benefits?: string;
    criteria?: string;
    status: 'active' | 'inactive';
    member_count: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminMembershipsPage() {
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Fetch memberships
    const fetchMemberships = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            });

            const response = await fetch(`/api/admin/memberships?${params}`);
            const data = await response.json();

            if (data.success) {
                setMemberships(data.data);
                setPagination(data.pagination);
            } else {
                toast.error(data.message || 'Lỗi khi tải dữ liệu');
            }
        } catch (error) {
            console.error('Error fetching memberships:', error);
            toast.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Delete membership
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/admin/memberships/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                fetchMemberships();
            } else {
                toast.error(data.message || 'Lỗi khi xóa gói thành viên');
            }
        } catch (error) {
            console.error('Error deleting membership:', error);
            toast.error('Lỗi khi xóa gói thành viên');
        }
        setDeleteId(null);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
            case 'inactive':
                return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    // Get theme color for membership
    const getThemeColor = (title: string) => {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('đồng') || titleLower.includes('bronze')) {
            return 'text-amber-600';
        } else if (titleLower.includes('bạc') || titleLower.includes('silver')) {
            return 'text-gray-600';
        } else if (titleLower.includes('vàng') || titleLower.includes('gold')) {
            return 'text-yellow-600';
        } else if (titleLower.includes('kim cương') || titleLower.includes('diamond')) {
            return 'text-blue-600';
        }
        return 'text-blue-600';
    };

    useEffect(() => {
        fetchMemberships();
    }, [pagination.page, searchTerm, statusFilter]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handle status filter
    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý gói thành viên</h1>
                    <p className="text-gray-600 mt-2">Quản lý các gói thành viên của hệ thống</p>
                </div>
                <Link href="/admin/memberships/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm gói thành viên
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Tìm kiếm theo tên, mã hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="inactive">Không hoạt động</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng gói thành viên</p>
                            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Eye className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {memberships.filter(m => m.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Users className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng thành viên</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {memberships.reduce((sum, m) => sum + m.member_count, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className='text-dark'>
                            <TableHead>Mã</TableHead>
                            <TableHead>Tên gói</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Số thành viên</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex justify-center items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2">Đang tải...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : memberships.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <p className="text-gray-500">Không có gói thành viên nào</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            memberships.map((membership) => (
                                <TableRow key={membership.id_membership}>
                                    <TableCell>
                                        <span className={`font-mono font-semibold ${getThemeColor(membership.title)}`}>
                                            {membership.code}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className={`font-semibold ${getThemeColor(membership.title)}`}>
                                                {membership.title}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-gray-600 max-w-xs truncate">
                                            {membership.description || 'Chưa có mô tả'}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-dark">
                                            <span>{membership.member_count} </span>
                                            
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(membership.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link className='bg-yellow-400' href={`/admin/memberships/edit/${membership.id_membership}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="w-4 h-4 " />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteId(membership.id_membership)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                        >
                            Trước
                        </Button>
                        <span className="flex items-center px-4">
                            Trang {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.totalPages}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
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
                            onClick={() => deleteId && handleDelete(deleteId)}
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