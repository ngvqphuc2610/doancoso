'use client';

import { Button } from '@/components/ui/button';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  agreeToTerms: boolean;
  agreeToPromotions: boolean;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (field: keyof CustomerInfo, value: string | boolean) => void;
  onNext: () => void;
  isValid: boolean;
  isLoggedIn?: boolean;
}

export default function CustomerInfoForm({
  customerInfo,
  onCustomerInfoChange,
  onNext,
  isValid,
  isLoggedIn = false
}: CustomerInfoFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Thông tin khách hàng</h2>

      {isLoggedIn && (
        <div className="bg-blue-600 border border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-blue-200 text-sm mr-2">ℹ️</span>
            <p className="text-blue-100 text-sm">
              Thông tin đã được tự động điền từ tài khoản của bạn. Bạn có thể chỉnh sửa nếu cần.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => onCustomerInfoChange('name', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => onCustomerInfoChange('phone', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
            placeholder="Nhập số điện thoại"
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => onCustomerInfoChange('email', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
            placeholder="Nhập email"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-white text-sm">
            <input
              type="checkbox"
              checked={customerInfo.agreeToTerms}
              onChange={(e) => onCustomerInfoChange('agreeToTerms', e.target.checked)}
              className="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
              required
            />
            Đồng ý với điều khoản sử dụng và quy định <span className="text-red-500">*</span>
          </label>

          <label className="flex items-center text-white text-sm">
            <input
              type="checkbox"
              checked={customerInfo.agreeToPromotions}
              onChange={(e) => onCustomerInfoChange('agreeToPromotions', e.target.checked)}
              className="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
            />
            Đăng ký nhận thông tin khuyến mãi từ Cinestar
          </label>
        </div>

        <Button
          type="submit"
          disabled={!isValid}
          className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          TIẾP TỤC
        </Button>
      </form>
    </div>
  );
}
