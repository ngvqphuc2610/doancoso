interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = "Đang tải lịch chiếu..." }: LoadingStateProps) {
    return (
        <div className="text-center text-white py-8">
            <div className="animate-pulse">
                <p>{message}</p>
            </div>
        </div>
    );
}

interface ErrorStateProps {
    error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
    return (
        <div className="text-center text-red-500 py-8">
            <p>{error}</p>
        </div>
    );
}

interface EmptyStateProps {
    status?: string;
    releaseDate?: string;
}

export function EmptyState({ status, releaseDate }: EmptyStateProps) {
    // Debug output for status and release date
    console.log(`EmptyState rendered with status: "${status}", releaseDate: "${releaseDate}"`);

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <img
                src="/images/icon-infofilm-clock.svg"
                alt="No showtimes"
                className="w-16 h-16 mb-4 opacity-50"
            />
            <h3 className="text-xl font-semibold text-white mb-2">
                Hiện chưa có lịch chiếu
            </h3>
            <p className="text-gray-400 text-center max-w-md">
                {status === 'coming soon' && releaseDate
                    ? `Phim sẽ khởi chiếu từ ngày ${new Date(releaseDate).toLocaleDateString('vi-VN')}`
                    : 'Vui lòng quay lại sau để xem lịch chiếu của phim này.'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
                Status: {status || 'N/A'} | ID: {window.location.pathname.split('/').pop() || 'unknown'}
            </p>
            {status === 'coming soon' && releaseDate && (
                <div className="mt-6 flex items-center gap-2">
                    <span className="px-4 py-2 bg-red-600 text-white rounded-full text-sm">
                        Sắp chiếu
                    </span>
                    <span className="text-gray-400">
                        ⌛ {Math.max(0, Math.ceil((new Date(releaseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} ngày nữa
                    </span>
                </div>
            )}
        </div>
    );
}
