import React from 'react';

export default function GymPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">GYM</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="prose max-w-none">
                    <p className="mb-4">
                        Đạt được mục tiêu thể hình của bạn tại C Gym - Đà Lạt & Thành phố Hồ Chí Minh!
                    </p>
                    <p className="mb-4">
                        Trang thiết bị hiện đại, không gian thoáng mát và đội ngũ huấn luyện viên chuyên nghiệp.
                    </p>
                    <p className="mb-4">
                        Các chương trình tập luyện được cá nhân hóa để phù hợp với mục tiêu của từng người.
                    </p>
                </div>
                <div>
                    <img
                        src="/images/gym.webp"
                        alt="Gym Area"
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}