'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

interface EditMemberModalProps {
    member: Member;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMemberModal({ member, onClose, onSuccess }: EditMemberModalProps) {
    const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        typeId: member.id_typemember?.toString() || '',
        membershipId: member.id_membership?.toString() || '',
        points: member.points.toString(),
        status: member.member_status
    });

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
        fetchMemberTypes();
        fetchMemberships();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setLoading(true);

        try {
            const response = await fetch('/api/admin/members', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: member.id_member,
                    typeId: formData.typeId ? parseInt(formData.typeId) : null,
                    membershipId: formData.membershipId ? parseInt(formData.membershipId) : null,
                    points: parseInt(formData.points) || 0,
                    status: formData.status
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Cập nhật thành viên thành công');
                onSuccess();
            } else {
                alert(data.message || 'Lỗi khi cập nhật thành viên');
            }
        } catch (error) {
            alert('Lỗi kết nối server');
            console.error('Error updating member:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Chỉnh sửa thành viên</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Member Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{member.full_name}</div>
                        <div className="text-sm text-gray-500">@{member.username} - {member.email}</div>
                        <div className="text-sm text-gray-500">
                            Ngày tham gia: {new Date(member.join_date).toLocaleDateString('vi-VN')}
                        </div>
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
                    <div className="mb-4">
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

                    {/* Points */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Điểm tích lũy
                        </label>
                        <input
                            type="number"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái *
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                        </select>
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
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
