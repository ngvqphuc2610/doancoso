"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Member {
    id_member: number;
    full_name: string;
    email: string;
    phone: string;
    membership_level: string;
    points: number;
    join_date: string;
    status: string;
}

export default function AdminMemberPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();    // Fetch members from the database
    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/admin/members', {
                timeout: 8000,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.data.success) {
                setMembers(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách thành viên');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách thành viên:', err);

            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách thành viên');
            }
        } finally {
            setLoading(false);
        }
    };

    // Change member status
    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const response = await axios.patch(`/api/admin/members/${id}`, {
                status: newStatus
            });

            if (response.data.success) {
                setMembers(members.map(member =>
                    member.id_member === id
                        ? { ...member, status: newStatus }
                        : member
                ));
            } else {
                alert(`Lỗi: ${response.data.message}`);
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái thành viên:', err);
            alert('Đã xảy ra lỗi khi cập nhật trạng thái thành viên');
        }
    };

    // Load members when the component mounts
    useEffect(() => {
        fetchMembers();
    }, []);

    // Get class for membership level
    const getMembershipLevelClass = (level: string) => {
        switch (level) {
            case 'platinum': return 'bg-purple-100 text-purple-800';
            case 'gold': return 'bg-yellow-100 text-yellow-800';
            case 'silver': return 'bg-gray-100 text-gray-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    // Get translated membership level
    const getMembershipLevelName = (level: string) => {
        switch (level) {
            case 'platinum': return 'Bạch Kim';
            case 'gold': return 'Vàng';
            case 'silver': return 'Bạc';
            default: return 'Thường';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý thành viên</h1>
                <Link href="/admin/members/add">
                    <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                        Thêm thành viên mới
                    </button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-xl">Đang tải danh sách thành viên...</p>
                </div>
            ) : members.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Họ tên</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Email</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Số điện thoại</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Hạng thành viên</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Điểm</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Ngày tham gia</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id_member}>
                                    <td className="py-3 px-4 border-b">{member.id_member}</td>
                                    <td className="py-3 px-4 border-b">{member.full_name}</td>
                                    <td className="py-3 px-4 border-b">{member.email}</td>
                                    <td className="py-3 px-4 border-b">{member.phone}</td>
                                    <td className="py-3 px-4 border-b">
                                        <span className={`px-2 py-1 rounded ${getMembershipLevelClass(member.membership_level)}`}>
                                            {getMembershipLevelName(member.membership_level)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">{member.points}</td>
                                    <td className="py-3 px-4 border-b">
                                        {new Date(member.join_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <span
                                            className={`px-2 py-1 rounded ${member.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {member.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/members/edit/${member.id_member}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                    Sửa
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleToggleStatus(member.id_member, member.status)}
                                                className={`${member.status === 'active'
                                                        ? 'bg-red-500 hover:bg-red-700'
                                                        : 'bg-green-500 hover:bg-green-700'
                                                    } text-white px-2 py-1 rounded text-sm`}
                                            >
                                                {member.status === 'active' ? 'Vô hiệu' : 'Kích hoạt'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-xl">Chưa có thành viên nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Thêm thành viên mới&quot; để thêm thành viên
                    </p>
                </div>
            )}
        </div>
    );
}
