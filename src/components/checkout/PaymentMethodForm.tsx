'use client';

import { Button } from '@/components/ui/button';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  processingFee?: number;
}

interface PaymentMethodFormProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onPaymentMethodChange: (methodId: string) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
  isLoggedIn?: boolean;
}

export default function PaymentMethodForm({
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onBack,
  onNext,
  isLoading = false,
  isLoggedIn = false
}: PaymentMethodFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaymentMethod && !isLoading) {
      onNext();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Chọn phương thức thanh toán</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => onPaymentMethodChange(method.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedPaymentMethod === method.id
                ? 'border-yellow-500 bg-gray-700 shadow-lg'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-650'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <div>
                    <div className="text-white font-medium">{method.name}</div>
                    {method.description && (
                      <div className="text-gray-400 text-sm mt-1">{method.description}</div>
                    )}
                    {method.processingFee && method.processingFee > 0 && (
                      <div className="text-yellow-400 text-xs mt-1">
                        Phí xử lý: {method.processingFee.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                    {method.minAmount && method.maxAmount && (
                      <div className="text-gray-500 text-xs mt-1">
                        Giới hạn: {method.minAmount.toLocaleString('vi-VN')}₫ - {method.maxAmount.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </div>
                </div>
                {selectedPaymentMethod === method.id && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Discount code input for specific payment method */}
        {selectedPaymentMethod === 'discount_code' && (
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Mã giảm giá
            </label>
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 text-lg"
          >
            {isLoggedIn ? 'CHỈNH SỬA THÔNG TIN' : 'QUAY LẠI'}
          </Button>
          <Button
            type="submit"
            disabled={!selectedPaymentMethod || isLoading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
          </Button>
        </div>
      </form>
    </div>
  );
}
