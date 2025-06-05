'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User, Mail, Phone, Calendar, Award, Users } from 'lucide-react';
import AddMemberModal from '@/components/admin/AddMemberModal';
import EditMemberModal from '@/components/admin/EditMemberModal';

interface Member {
    id_member: number;
    id_user: number;
    id_typemember: number;
    id_membership: number;
    points: number;
    join_date: string;
    member_status: string;
    username: string;
    email: string;
    full_name: string;
    phone_number?: string;
    profile_image?: string;
    user_created_at: string;
    type_name?: string;
    type_description?: string;
    membership_title?: string;
    membership_benefits?: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function AdminMembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const fetchMembers = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString()
            });

            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);

            const response = await fetch(`/api/admin/members?${params}`);
            const data = await response.json();

            if (data.success) {
                setMembers(data.data.members);
                setPagination(data.data.pagination);
                setError('');
            } else {
                setError(data.message || 'Lỗi khi tải danh sách thành viên');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [search, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMembers(1);
    };

    const handleEdit = (member: Member) => {
        setSelectedMember(member);
        setShowEditModal(true);
    };

    const handleDelete = async (memberId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return;

        try {
            const response = await fetch(`/api/admin/members?id=${memberId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                fetchMembers(pagination.page);
                alert('Xóa thành viên thành công');
            } else {
                alert(data.message || 'Lỗi khi xóa thành viên');
            }
        } catch (err) {
            alert('Lỗi kết nối server');
            console.error('Error deleting member:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 text-dark">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý thành viên</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm thành viên</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email, username..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Members Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thành viên nào</h3>
                        <p className="text-gray-600">Chưa có thành viên nào trong hệ thống.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thành viên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Liên hệ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loại thành viên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Điểm
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tham gia
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {members.map((member) => (
                                        <tr key={member.id_member} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                        {member.profile_image ? (
                                                            <img
                                                                src={member.profile_image}
                                                                alt={member.full_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {member.full_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{member.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <Mail className="w-4 h-4 mr-1" />
                                                    {member.email}
                                                </div>
                                                {member.phone_number && (
                                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                                        <Phone className="w-4 h-4 mr-1" />
                                                        {member.phone_number}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Award className="w-4 h-4 mr-2 text-yellow-500" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {member.type_name || 'Cơ bản'}
                                                        </div>
                                                        {member.membership_title && (
                                                            <div className="text-sm text-gray-500">
                                                                {member.membership_title}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {member.points} điểm
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.member_status)}`}>
                                                    {member.member_status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(member.join_date).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member.id_member)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} trong{' '}
                                        {pagination.total} kết quả
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => fetchMembers(pagination.page - 1)}
                                            disabled={!pagination.hasPrev}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Trước
                                        </button>
                                        <span className="px-3 py-2 text-sm">
                                            Trang {pagination.page} / {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => fetchMembers(pagination.page + 1)}
                                            disabled={!pagination.hasNext}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddMemberModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchMembers();
                    }}
                />
            )}

            {showEditModal && selectedMember && (
                <EditMemberModal
                    member={selectedMember}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedMember(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedMember(null);
                        fetchMembers();
                    }}
                />
            )}
        </div>
    );
}
