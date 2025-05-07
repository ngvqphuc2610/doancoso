'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { CheckCircleIcon, XCircleIcon, RefreshCw, DatabaseIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SyncLog {
    id_log: number;
    action: string;
    status: string;
    description: string;
    error: string | null;
    started_at: string;
    completed_at: string | null;
}

export default function SyncMoviesPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
    const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        eventId?: string;
        error?: string;
    } | null>(null);

    // Tải lịch sử đồng bộ
    const fetchSyncLogs = async () => {
        try {
            setIsLoadingLogs(true);
            const response = await axios.get('/api/admin/sync-logs');
            if (response.data.success) {
                setSyncLogs(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sync logs:', error);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    // Tải lịch sử đồng bộ khi component được tải
    useEffect(() => {
        fetchSyncLogs();
    }, []);

    // Kích hoạt đồng bộ phim
    const handleSync = async () => {
        try {
            setIsLoading(true);
            setResult(null);

            // Gọi API đồng bộ phim
            const response = await axios.post('/api/admin/sync-movies');
            const data = response.data;

            setResult({
                success: data.success,
                message: data.message,
                eventId: data.eventId
            });

            // Tải lại lịch sử đồng bộ sau khi kích hoạt đồng bộ
            fetchSyncLogs();
        } catch (error) {
            console.error('Error syncing movies:', error);

            let errorMessage = 'Đã xảy ra lỗi khi đồng bộ phim. Vui lòng thử lại sau.';
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setResult({
                success: false,
                message: errorMessage,
                error: axios.isAxiosError(error) && error.response?.data?.error
                    ? error.response.data.error
                    : 'Unknown error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Kiểm tra trạng thái đồng bộ
    const checkSyncStatus = async () => {
        try {
            setIsCheckingStatus(true);
            await fetchSyncLogs();
        } catch (error) {
            console.error('Error checking sync status:', error);
        } finally {
            setIsCheckingStatus(false);
        }
    };

    // Format thời gian đẹp hơn
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Hiển thị trạng thái đồng bộ
    const renderStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <Badge className="bg-green-500">Thành công</Badge>;
            case 'error':
                return <Badge className="bg-red-500">Lỗi</Badge>;
            case 'started':
                return <Badge className="bg-blue-500">Đang chạy</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="container max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Quản lý đồng bộ phim</h1>

            <Tabs defaultValue="sync">
                <TabsList className="mb-6">
                    <TabsTrigger value="sync">Đồng bộ phim</TabsTrigger>
                    <TabsTrigger value="history">Lịch sử đồng bộ</TabsTrigger>
                </TabsList>

                <TabsContent value="sync">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Đồng bộ phim từ TMDB API</CardTitle>
                            <CardDescription>
                                Công cụ này sẽ tải phim mới từ TMDB API và cập nhật vào cơ sở dữ liệu của bạn.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                <h3 className="font-semibold mb-2">Lưu ý:</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Quá trình đồng bộ có thể mất vài phút tùy thuộc vào số lượng phim.</li>
                                    <li>Phim hiện đang chiếu và phim sắp chiếu sẽ được cập nhật.</li>
                                    <li>Dữ liệu phim hiện có sẽ được cập nhật nếu đã tồn tại trong hệ thống.</li>
                                </ul>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={handleSync}
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Đang đồng bộ...
                                        </>
                                    ) : (
                                        <>
                                            <DatabaseIcon className="mr-2 h-4 w-4" />
                                            Bắt đầu đồng bộ
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={checkSyncStatus}
                                    disabled={isCheckingStatus}
                                    variant="custom1"
                                >
                                    {isCheckingStatus ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Đang kiểm tra...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Kiểm tra trạng thái
                                        </>
                                    )}
                                </Button>
                            </div>

                            {result && (
                                <Alert
                                    className={`mt-4 ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                                        }`}
                                >
                                    {result.success ? (
                                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircleIcon className="h-4 w-4 text-red-600" />
                                    )}
                                    <AlertTitle>{result.success ? 'Thành công' : 'Lỗi'}</AlertTitle>
                                    <AlertDescription>
                                        <p>{result.message}</p>
                                        {result.eventId && (
                                            <div className="mt-2 text-sm">
                                                <strong>Event ID:</strong> {result.eventId}
                                            </div>
                                        )}
                                        {result.error && (
                                            <div className="mt-2 text-sm">
                                                <strong>Chi tiết lỗi:</strong> {result.error}
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Lịch sử đồng bộ</span>
                                <Button
                                    size="sm"
                                    variant="custom1"
                                    onClick={fetchSyncLogs}
                                    disabled={isLoadingLogs}
                                >
                                    {isLoadingLogs ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    <span className="ml-1">Làm mới</span>
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingLogs ? (
                                <div className="text-center py-6">
                                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Đang tải lịch sử...</p>
                                </div>
                            ) : syncLogs.length > 0 ? (
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Thao tác</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Mô tả</TableHead>
                                                <TableHead>Bắt đầu</TableHead>
                                                <TableHead>Kết thúc</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {syncLogs.map((log) => (
                                                <TableRow key={log.id_log}>
                                                    <TableCell>{log.id_log}</TableCell>
                                                    <TableCell>{log.action}</TableCell>
                                                    <TableCell>{renderStatus(log.status)}</TableCell>
                                                    <TableCell className="max-w-xs truncate" title={log.description}>
                                                        {log.description}
                                                    </TableCell>
                                                    <TableCell>{formatDate(log.started_at)}</TableCell>
                                                    <TableCell>{formatDate(log.completed_at)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>Chưa có lịch sử đồng bộ nào.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}