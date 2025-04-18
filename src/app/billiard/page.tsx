import React from 'react';

export default function BilliardPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">BILLIARD</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="prose max-w-none">
                    <p className="mb-4">
                        Thỏa sức thể hiện tài năng ca hát của bạn tại Karaoke CineStar!
                    </p>
                    <p className="mb-4">
                        Khám phá không gian billiard đẳng cấp tại CineStar với các bàn bi-a chất lượng cao và không gian thoáng đãng.
                    </p>
                    <p className="mb-4">
                        Đội ngũ nhân viên chuyên nghiệp sẵn sàng hỗ trợ và hướng dẫn bạn những kỹ thuật cơ bản.
                    </p>
                </div>
                <div>
                    <img
                        src="/images/billiards.webp"
                        alt="Billiard Area"
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}