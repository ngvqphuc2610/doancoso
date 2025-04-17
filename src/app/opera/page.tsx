import React from 'react';

export default function OperaPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">OPERA HOUSE</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="prose max-w-none">
                    <p className="mb-4">
                        Chứng kiến sự hùng vĩ ở trung tâm thành phố
                    </p>
                    <p className="mb-4">
                        Khám phá không gian nghệ thuật đẳng cấp với các buổi biểu diễn opera, nhạc kịch và âm nhạc cổ điển.
                    </p>
                    <p className="mb-4">
                        Tận hưởng những đêm diễn tuyệt vời trong không gian kiến trúc độc đáo của Opera House.
                    </p>
                </div>
                <div>
                    <img
                        src="/images/opera.webp"
                        alt="Opera House"
                        className="w-full rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
}