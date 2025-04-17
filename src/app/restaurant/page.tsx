import React from 'react';

export default function RestaurantPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">NHÀ HÀNG</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="prose max-w-none">
                    <p className="mb-4">
                        Bắt tay vào cuộc phiêu lưu ẩm thực tại Món Ngon Đà Lạt & Huế!
                    </p>
                    <p className="mb-4">
                        Thưởng thức các món ăn đặc sản địa phương và quốc tế trong không gian sang trọng.
                    </p>
                    <p className="mb-4">
                        Đội ngũ đầu bếp chuyên nghiệp của chúng tôi luôn sẵn sàng phục vụ bạn những món ăn ngon miệng nhất.
                    </p>
                </div>
                <div>
                    <img
                        src="/images/monngon.webp"
                        alt="Nhà hàng"
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}