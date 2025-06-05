'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';

interface User {
    id_users: number;
    username: string;
    email: string;
    full_name: string;
    phone_number?: string;
    role: string;
    created_at: string;
}

interface MemberType {
    id_typemember: number;
    type_name: string;
    description: string;
    priority: number;
}

interface Membership {
    id_membership: number;
    title: string;
    benefits: string;
    description: string;
    status: string;
}

interface AddMemberModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMemberModal({ onClose, onSuccess }: AddMemberModalProps) {
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSearch, setUserSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        typeId: '',
        membershipId: ''
    });

    const fetchAvailableUsers = async () => {
        try {
            const params = new URLSearchParams({
                type: 'member'
            });
            if (userSearch) params.append('search', userSearch);

            const response = await fetch(`/api/admin/users/available?${params}`);
            const data = await response.json();

            if (data.success) {
                setAvailableUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching available users:', error);
        }
    };

    const fetchMemberTypes = async () => {
        try {
            const response = await fetch('/api/admin/member-types');
            const data = await response.json();

            if (data.success) {
                setMemberTypes(data.data);
            }
        } catch (error) {
            console.error('Error fetching member types:', error);
        }
    };

    const fetchMemberships = async () => {
        try {
            const response = await fetch('/api/admin/memberships');
            const data = await response.json();

            if (data.success) {
                setMemberships(data.data);
            }
        } catch (error) {
            console.error('Error fetching memberships:', error);
        }
    };

    useEffect(() => {
        fetchAvailableUsers();
    }, [userSearch]);

    useEffect(() => {
        fetchMemberTypes();
        fetchMemberships();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedUser) {
            alert('Vui lòng chọn người dùng');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selectedUser.id_users,
                    typeId: formData.typeId ? parseInt(formData.typeId) : null,
                    membershipId: formData.membershipId ? parseInt(formData.membershipId) : null
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Tạo thành viên thành công');
                onSuccess();
            } else {
                alert(data.message || 'Lỗi khi tạo thành viên');
            }
        } catch (error) {
            alert('Lỗi kết nối server');
            console.error('Error creating member:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Thêm thành viên mới</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* User Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn người dùng *
                        </label>
                        
                        {/* Search Users */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Selected User */}
                        {selectedUser && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <User className="w-5 h-5 text-blue-500 mr-2" />
                                        <div>
                                            <div className="font-medium text-blue-900">{selectedUser.full_name}</div>
                                            <div className="text-sm text-blue-600">@{selectedUser.username} - {selectedUser.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="text-blue-400 hover:text-blue-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Available Users List */}
                        {!selectedUser && (
                            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                                {availableUsers.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        Không tìm thấy người dùng nào
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {availableUsers.map((user) => (
                                            <button
                                                key={user.id_users}
                                                type="button"
                                                onClick={() => setSelectedUser(user)}
                                                className="w-full p-3 text-left hover:bg-gray-50 flex items-center"
                                            >
                                                <User className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.full_name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        @{user.username} - {user.email}
                                                    </div>
                                                    {user.phone_number && (
                                                        <div className="text-sm text-gray-500">{user.phone_number}</div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Member Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại thành viên
                        </label>
                        <select
                            value={formData.typeId}
                            onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Chọn loại thành viên</option>
                            {memberTypes.map((type) => (
                                <option key={type.id_typemember} value={type.id_typemember}>
                                    {type.type_name} - {type.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Membership Package */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gói thành viên
                        </label>
                        <select
                            value={formData.membershipId}
                            onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Chọn gói thành viên</option>
                            {memberships.map((membership) => (
                                <option key={membership.id_membership} value={membership.id_membership}>
                                    {membership.title}
                                </option>
                            ))}
                        </select>
                        {formData.membershipId && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                {memberships.find(m => m.id_membership.toString() === formData.membershipId)?.benefits}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedUser}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo thành viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
