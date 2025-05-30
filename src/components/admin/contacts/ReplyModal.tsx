'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Contact } from '@/types/contact';

interface ReplyModalProps {
  contact: Contact;
  onClose: () => void;
  onSave: () => void;
}

export default function ReplyModal({ contact, onClose, onSave }: ReplyModalProps) {
  const [reply, setReply] = useState(contact.reply || '');
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/contacts/${contact.id_contact}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'replied',
          reply: reply.trim(),
          sendEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.emailError) {
          alert('Phản hồi đã được lưu nhưng không thể gửi email. Vui lòng kiểm tra cấu hình email.');
        }
        onSave();
      } else {
        const data = await response.json();
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Có lỗi xảy ra khi gửi phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Phản hồi liên hệ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contact Info */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Thông tin liên hệ</h3>
              <div className="space-y-1 text-sm">
                <div><span className="text-gray-400">Tên:</span> <span className="text-white">{contact.name}</span></div>
                <div><span className="text-gray-400">Email:</span> <span className="text-white">{contact.email}</span></div>
                <div><span className="text-gray-400">Ngày gửi:</span> <span className="text-white">{formatDate(contact.contact_date)}</span></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Chủ đề</h3>
              <p className="text-white text-sm">{contact.subject}</p>
            </div>
          </div>
        </div>

        {/* Original Message */}
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-2">Tin nhắn gốc</h3>
          <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-blue-500">
            <p className="text-white whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>

        {/* Previous Reply (if exists) */}
        {contact.reply && (
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-2">
              Phản hồi trước đó
              {contact.reply_date && (
                <span className="text-sm text-gray-400 font-normal">
                  ({formatDate(contact.reply_date)})
                </span>
              )}
              {contact.id_staff && (
                <span className="text-sm text-gray-400 font-normal">
                  - bởi {contact.staff_name}
                </span>
              )}
            </h3>
            <div className="p-4 bg-gray-700 rounded-lg border-l-4 border-green-500">
              <p className="text-white whitespace-pre-wrap">{contact.reply}</p>
              {contact.staff_email && (
                <div className="mt-2 text-xs text-gray-400">
                  Staff email: {contact.staff_email}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {contact.reply ? 'Phản hồi mới' : 'Phản hồi'} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập phản hồi của bạn..."
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="sendEmail" className="text-sm text-white">
              Gửi email phản hồi đến khách hàng
            </label>
          </div>

          {sendEmail && (
            <div className="p-3 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-600">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-200">
                  <p className="font-medium">Email sẽ được gửi đến: {contact.email}</p>
                  <p>Email sẽ bao gồm tin nhắn gốc và phản hồi của bạn.</p>
                </div>
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
            <Button
              type="submit"
              disabled={loading || !reply.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Đang gửi...' : (sendEmail ? 'Gửi phản hồi' : 'Lưu phản hồi')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
