'use client';

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: 'unread' | 'read' | 'replied';
}

interface ContactFormProps {
  // Data props
  initialData?: ContactFormData;
  isEditing?: boolean;
  
  // Styling props
  variant?: 'public' | 'admin';
  className?: string;
  
  // Behavior props
  onSubmit?: (data: ContactFormData) => Promise<void>;
  onCancel?: () => void;
  
  // State props
  loading?: boolean;
  showStatus?: boolean;
  
  // Labels
  submitLabel?: string;
  cancelLabel?: string;
}

export default function ContactForm({
  initialData,
  isEditing = false,
  variant = 'public',
  className = '',
  onSubmit,
  onCancel,
  loading = false,
  showStatus = false,
  submitLabel,
  cancelLabel = 'Hủy'
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    status: 'unread'
  });
  
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default behavior for public form
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Có lỗi xảy ra khi gửi liên hệ');
        }

        setNotification({
          type: 'success',
          message: data.message || 'Gửi liên hệ thành công!'
        });

        // Reset form only on success for public form
        if (variant === 'public') {
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            status: 'unread'
          });
        }
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Không thể gửi liên hệ. Vui lòng thử lại sau.'
      });
    }
  };

  // Styling based on variant
  const isAdmin = variant === 'admin';
  const containerClass = isAdmin 
    ? `space-y-4 ${className}`
    : `bg-blue-600 rounded-lg p-6 shadow-lg ${className}`;
  
  const inputClass = isAdmin
    ? "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
    : "w-full bg-white text-black border-gray-600";
    
  const labelClass = isAdmin
    ? "block text-sm font-medium text-white mb-2"
    : "sr-only";

  const getSubmitLabel = () => {
    if (submitLabel) return submitLabel;
    if (loading) return isEditing ? 'Đang cập nhật...' : 'Đang gửi...';
    return isEditing ? 'Cập nhật' : 'Gửi liên hệ';
  };

  return (
    <div className={containerClass}>
      {!isAdmin && (
        <h2 className="text-2xl font-bold mb-4 text-white">THÔNG TIN LIÊN HỆ</h2>
      )}

      {notification && (
        <div className={`mb-4 p-4 rounded-md ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {isAdmin && (
            <label className={labelClass}>
              Họ tên <span className="text-red-500">*</span>
            </label>
          )}
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={isAdmin ? "" : "Họ tên"}
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isEditing && !isAdmin}
            className={inputClass}
          />
        </div>

        <div>
          {isAdmin && (
            <label className={labelClass}>
              Email <span className="text-red-500">*</span>
            </label>
          )}
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={isAdmin ? "" : "Email"}
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEditing && !isAdmin}
            className={inputClass}
          />
        </div>

        <div>
          {isAdmin && (
            <label className={labelClass}>
              Chủ đề <span className="text-red-500">*</span>
            </label>
          )}
          <Input
            id="subject"
            name="subject"
            type="text"
            placeholder={isAdmin ? "" : "Chủ đề"}
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isEditing && !isAdmin}
            className={inputClass}
          />
        </div>

        <div>
          {isAdmin && (
            <label className={labelClass}>
              Nội dung <span className="text-red-500">*</span>
            </label>
          )}
          <Textarea
            id="message"
            name="message"
            placeholder={isAdmin ? "" : "Nội dung"}
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isEditing && !isAdmin}
            rows={isAdmin ? 6 : 8}
            className={isAdmin 
              ? inputClass
              : "w-full min-h-[150px] bg-white text-dark border-gray-600"
            }
          />
        </div>

        {showStatus && isAdmin && (
          <div>
            <label className={labelClass}>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="unread">Chưa đọc</option>
              <option value="read">Đã đọc</option>
              <option value="replied">Đã phản hồi</option>
            </select>
          </div>
        )}

        <div className={isAdmin ? "flex justify-end space-x-3 pt-4" : ""}>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
              className="text-gray-400 border border-gray-600 hover:bg-gray-700"
            >
              {cancelLabel}
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={loading}
            variant={isAdmin ? "default" : "custom3"}
            className={isAdmin ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {getSubmitLabel()}
          </Button>
        </div>
      </form>
    </div>
  );
}
