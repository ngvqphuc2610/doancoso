'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Contact } from '@/types/contact';

interface ContactModalProps {
  contact: Contact | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ContactModal({ contact, onClose, onSave }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    status: 'unread' as 'unread' | 'read' | 'replied'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        status: contact.status
      });
    } else {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        status: 'unread'
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = contact
        ? `/api/admin/contacts/${contact.id_contact}`
        : '/api/admin/contacts';

      const method = contact ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Có lỗi xảy ra khi lưu liên hệ');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {contact ? 'Chi tiết liên hệ' : 'Tạo liên hệ mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {contact && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">ID:</span>
                <span className="ml-2 text-white">{contact.id_contact}</span>
              </div>
              <div>
                <span className="text-gray-400">Ngày tạo:</span>
                <span className="ml-2 text-white">{formatDate(contact.contact_date)}</span>
              </div>
              <div>
                <span className="text-gray-400">Trạng thái:</span>
                <span className="ml-2 text-white">
                  {contact.status === 'unread' && 'Chưa đọc'}
                  {contact.status === 'read' && 'Đã đọc'}
                  {contact.status === 'replied' && 'Đã phản hồi'}
                </span>
              </div>
              {contact.id_staff ? (
                <div>
                  <span className="text-gray-400">Staff phụ trách:</span>
                  <span className="ml-2 text-white">{contact.staff_name}</span>
                </div>
              ) : (
                <div>
                  <span className="text-gray-400">Staff phụ trách:</span>
                  <span className="ml-2 text-gray-500">Chưa có</span>
                </div>
              )}
              {contact.reply_date && (
                <>
                  <div>
                    <span className="text-gray-400">Ngày phản hồi:</span>
                    <span className="ml-2 text-white">{formatDate(contact.reply_date)}</span>
                  </div>
                  {contact.staff_email && (
                    <div>
                      <span className="text-gray-400">Email staff:</span>
                      <span className="ml-2 text-white">{contact.staff_email}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!contact}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!contact}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Chủ đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!contact}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!contact}
            />
          </div>

          {contact && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
                <option value="replied">Đã phản hồi</option>
              </select>
            </div>
          )}

          {contact && contact.reply && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phản hồi
              </label>
              <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                {contact.reply}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 border border-gray-600 hover:bg-gray-700"
            >
              Hủy
            </Button>
            {!contact && (
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Đang lưu...' : 'Tạo liên hệ'}
              </Button>
            )}
            {contact && (
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
