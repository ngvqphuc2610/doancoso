'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ContactsTable from '@/components/admin/contacts/ContactsTable';
import ContactModal from '@/components/admin/contacts/ContactModal';
import ReplyModal from '@/components/admin/contacts/ReplyModal';
import { Contact, ContactPagination, ContactFilters } from '@/types/contact';

export default function AdminContactsPage() {
  const { user, isAdmin } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<ContactPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [filters, setFilters] = useState<ContactFilters>({
    status: 'all',
    search: ''
  });

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/admin/contacts?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setContacts(data.data.contacts);
          setPagination(data.data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchContacts();
    }
  }, [pagination.page, filters, isAdmin]);

  // Handle contact actions
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const handleReplyContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowReplyModal(true);
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) return;

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchContacts(); // Refresh list
      } else {
        alert('Không thể xóa liên hệ');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Có lỗi xảy ra khi xóa liên hệ');
    }
  };

  const handleStatusChange = async (contactId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchContacts(); // Refresh list
      } else {
        alert('Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle filters
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
          <p>Bạn cần quyền admin để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quản lý liên hệ</h1>
            <p className="text-gray-400 mt-2">
              Quản lý và phản hồi các liên hệ từ khách hàng
            </p>
          </div>
          <Button
            onClick={() => setShowContactModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tạo liên hệ mới
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
                <option value="replied">Đã phản hồi</option>
              </select>
            </div>
            <div className='text-dark'>
              <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Tìm theo tên, email, chủ đề..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchContacts}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <ContactsTable
          contacts={contacts}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewContact={handleViewContact}
          onReplyContact={handleReplyContact}
          onDeleteContact={handleDeleteContact}
          onStatusChange={handleStatusChange}
        />

        {/* Modals */}
        {showContactModal && (
          <ContactModal
            contact={selectedContact}
            onClose={() => {
              setShowContactModal(false);
              setSelectedContact(null);
            }}
            onSave={() => {
              fetchContacts();
              setShowContactModal(false);
              setSelectedContact(null);
            }}
          />
        )}

        {showReplyModal && selectedContact && (
          <ReplyModal
            contact={selectedContact}
            onClose={() => {
              setShowReplyModal(false);
              setSelectedContact(null);
            }}
            onSave={() => {
              fetchContacts();
              setShowReplyModal(false);
              setSelectedContact(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
