'use client';

import { Button } from '@/components/ui/button';
import { Contact, ContactPagination } from '@/types/contact';

interface ContactsTableProps {
  contacts: Contact[];
  loading: boolean;
  pagination: ContactPagination;
  onPageChange: (page: number) => void;
  onViewContact: (contact: Contact) => void;
  onReplyContact: (contact: Contact) => void;
  onDeleteContact: (contactId: number) => void;
  onStatusChange: (contactId: number, status: string) => void;
}

export default function ContactsTable({
  contacts,
  loading,
  pagination,
  onPageChange,
  onViewContact,
  onReplyContact,
  onDeleteContact,
  onStatusChange
}: ContactsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      unread: { label: 'Chưa đọc', color: 'bg-red-600' },
      read: { label: 'Đã đọc', color: 'bg-yellow-600' },
      replied: { label: 'Đã phản hồi', color: 'bg-green-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unread;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Thông tin liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Chủ đề & Nội dung
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Không có liên hệ nào
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id_contact} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{contact.name}</div>
                      <div className="text-sm text-gray-400">{contact.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{truncateText(contact.subject)}</div>
                      <div className="text-sm text-gray-400">{truncateText(contact.message, 80)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {getStatusBadge(contact.status)}
                      {contact.status === 'replied' && contact.id_staff && (
                        <div className="text-xs text-gray-400">
                          Phản hồi bởi: {contact.staff_name}
                          {contact.reply_date && (
                            <div className="text-xs text-gray-500">
                              {formatDate(contact.reply_date)}
                            </div>
                          )}
                        </div>
                      )}
                      {!contact.id_staff && contact.status !== 'unread' && (
                        <div className="text-xs text-gray-500">
                          Chưa có staff phụ trách
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatDate(contact.contact_date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        width="custom8"
                        variant="ghost"
                        onClick={() => onViewContact(contact)}
                        className="text-blue-400 border border-blue-400 hover:bg-blue-400 hover:text-white"
                      >
                        Xem
                      </Button>
                      <Button
                        size="sm"
                        width="custom8"
                        variant="ghost"
                        onClick={() => onReplyContact(contact)}
                        className="text-green-400 border border-green-400 hover:bg-green-400 hover:text-white"
                      >
                        Phản hồi
                      </Button>
                      <select
                        value={contact.status}
                        onChange={(e) => onStatusChange(contact.id_contact, e.target.value)}
                        className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded"
                      >
                        <option value="unread">Chưa đọc</option>
                        <option value="read">Đã đọc</option>
                        <option value="replied">Đã phản hồi</option>
                      </select>
                      <Button
                        size="sm"
                        width="custom8"
                        variant="ghost"
                        onClick={() => onDeleteContact(contact.id_contact)}
                        className="text-red-400 border border-red-400 hover:bg-red-400 hover:text-white"
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}
            trong tổng số {pagination.total} liên hệ
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="text-gray-400 border border-gray-600 hover:bg-gray-600"
            >
              Trước
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum > pagination.totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={pageNum === pagination.page ? "default" : "ghost"}
                  onClick={() => onPageChange(pageNum)}
                  className={pageNum === pagination.page
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 border border-gray-600 hover:bg-gray-600"
                  }
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="text-gray-400 border border-gray-600 hover:bg-gray-600"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
