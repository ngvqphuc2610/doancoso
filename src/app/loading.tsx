import React from 'react';

export default function Loading() {
    return (
        <div className="flex justify-center items-center fixed inset-0 h-screen w-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cinestar-yellow"></div>
            <span className="ml-3 text-cinestar-yellow">Đang tải...</span>
        </div>
    );
}