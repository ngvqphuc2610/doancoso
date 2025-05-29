import { useState, useEffect } from 'react';

export interface PaymentMethod {
  id_payment_method: number;
  method_code: string;
  method_name: string;
  description: string;
  icon_url: string;
  processing_fee: number;
  min_amount: number;
  max_amount: number | null;
  display_order: number;
}

interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePaymentMethods = (): UsePaymentMethodsReturn => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payment-methods', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPaymentMethods(result.data);
        
        // Log if using fallback data
        if (result.fallback) {
          console.warn('Using fallback payment methods data:', result.error);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch payment methods');
      }

    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Set default payment methods as fallback
      setPaymentMethods([
        {
          id_payment_method: 1,
          method_code: 'momo',
          method_name: 'Thanh toán qua Momo',
          description: 'Thanh toán nhanh chóng và an toàn qua ví điện tử Momo',
          icon_url: '📱',
          processing_fee: 0,
          min_amount: 10000,
          max_amount: 50000000,
          display_order: 1
        },
        {
          id_payment_method: 2,
          method_code: 'domestic_card',
          method_name: 'Thanh toán qua Thẻ nội địa',
          description: 'Thanh toán bằng thẻ ATM/Debit nội địa (Napas)',
          icon_url: '💳',
          processing_fee: 0,
          min_amount: 10000,
          max_amount: 50000000,
          display_order: 2
        },
        {
          id_payment_method: 3,
          method_code: 'international_card',
          method_name: 'Thanh toán qua Thẻ quốc tế',
          description: 'Thanh toán bằng thẻ Visa/Mastercard/JCB',
          icon_url: '🌍',
          processing_fee: 0,
          min_amount: 10000,
          max_amount: 50000000,
          display_order: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const refetch = async () => {
    await fetchPaymentMethods();
  };

  return {
    paymentMethods,
    loading,
    error,
    refetch
  };
};

// Helper function to get payment method color based on code
export const getPaymentMethodColor = (methodCode: string): string => {
  const colorMap: Record<string, string> = {
    'momo': 'bg-pink-600',
    'domestic_card': 'bg-blue-600',
    'international_card': 'bg-green-600',
    'bank_transfer': 'bg-purple-600',
    'cash': 'bg-yellow-600'
  };
  
  return colorMap[methodCode] || 'bg-gray-600';
};

// Helper function to validate payment amount
export const validatePaymentAmount = (
  amount: number, 
  paymentMethod: PaymentMethod
): { isValid: boolean; error?: string } => {
  if (amount < paymentMethod.min_amount) {
    return {
      isValid: false,
      error: `Số tiền tối thiểu cho ${paymentMethod.method_name} là ${paymentMethod.min_amount.toLocaleString('vi-VN')}₫`
    };
  }

  if (paymentMethod.max_amount && amount > paymentMethod.max_amount) {
    return {
      isValid: false,
      error: `Số tiền tối đa cho ${paymentMethod.method_name} là ${paymentMethod.max_amount.toLocaleString('vi-VN')}₫`
    };
  }

  return { isValid: true };
};
