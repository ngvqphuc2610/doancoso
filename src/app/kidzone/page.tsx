import React from 'react';

export default function KidzonePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">KIDZONE</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="prose max-w-none">
                    <p className="mb-4">
                        Giải phóng trí tưởng tượng của con bạn tại Kidzone, sân chơi trong nhà tuyệt đỉnh.
                    </p>
                    <p className="mb-4">
                        Hãy để các bé khám phá một thế giới vui nhộn và khám phá tại Kidzone, khu vui chơi trong nhà rộng rãi được thiết kế dành cho trẻ em ở mọi lứa tuổi.
                    </p>
                    <p className="mb-4">
                        C'Kidzone cung cấp hơn 25 trò chơi đa dạng và hấp dẫn, bao gồm các hồ banh kết hợp chướng ngại với đầy thử thách và mạng tưởng leo núi thú vị.
                    </p>
                </div>
                <div>
                    <img
                        src="/images/kidzone.webp"
                        alt="Kidzone Play Area"
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}