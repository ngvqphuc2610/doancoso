'use client';

interface CheckoutHeaderProps {
  currentStep: number;
}

export default function CheckoutHeader({ currentStep }: CheckoutHeaderProps) {
  const steps = [
    { number: 1, title: 'THÔNG TIN KHÁCH HÀNG' },
    { number: 2, title: 'THANH TOÁN' },
    { number: 3, title: 'THÔNG TIN VÉ PHIM' }
  ];

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-white mb-4">TRANG THANH TOÁN</h1>

      {/* Steps indicator */}
      <div className="flex justify-center items-center space-x-8 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                currentStep >= step.number ? 'bg-yellow-500' : 'bg-gray-500'
              }`}>
                {step.number}
              </div>
              <span className={`text-sm mt-2 ${
                currentStep >= step.number ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-16 ml-8 ${
                currentStep >= step.number + 1 ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
