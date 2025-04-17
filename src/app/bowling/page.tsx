import React from 'react';

export default function BowlingPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">BOWLING</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="prose max-w-none">
                    <p className="mb-4">
                        Tận hưởng niềm vui tại C'Bowling - Thành phố Đà Lạt & Huế!
                    </p>
                    <p className="mb-4">
                        Chinh phục nhà vô địch bên trong bạn tại C'Bowling, điểm đến bowling hàng đầu của Đà Lạt và Huế!
                        Trung tâm nằm tại vị trí thuận tiện trong khu phức hợp rạp chiếu phim Cinestar.
                    </p>
                    <p className="mb-4">
                        Trung tâm có đội ngũ nhân viên sẵn sàng hướng dẫn các kỹ năng cơ bản dành cho Khách mới bắt đầu.
                    </p>
                    <p className="mb-4">
                        Thử thách bản thân bằng cách tham gia các giải đấu giao hữu được tổ chức thường xuyên của Trung tâm.
                    </p>
                </div>
                <div>
                    <img
                        src="/images/bowling.webp"
                        alt="Bowling Center"
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}