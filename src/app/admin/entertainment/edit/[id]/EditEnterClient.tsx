'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from 'next/image';
import { Entertainment } from '@/lib/types/database';

const formSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    description: z.string().optional(),
    image_url: z.string().optional(),
    start_date: z.string().min(1, "Ngày bắt đầu không được để trống"),
    end_date: z.string().optional(),
    status: z.enum(['active', 'inactive']),
    featured: z.boolean().optional(),
});

export default function EditEnterClient({ entertainment }: { entertainment: Entertainment }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>(entertainment.image_url || '');
    const [uploading, setUploading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: entertainment.title,
            description: entertainment.description || "",
            image_url: entertainment.image_url || "",
            start_date: entertainment.start_date ? new Date(entertainment.start_date).toISOString().split('T')[0] : "",
            end_date: entertainment.end_date ? new Date(entertainment.end_date).toISOString().split('T')[0] : "",
            status: entertainment.status,
            featured: entertainment.featured || false,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/entertainment/${entertainment.id_entertainment}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                router.push('/admin/entertainment');
                router.refresh();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update entertainment');
            }
        } catch (error) {
            alert(`Lỗi khi cập nhật: ${error instanceof Error ? error.message : 'Đã xảy ra lỗi'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Vui lòng chọn file hình ảnh");
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert("Kích thước hình ảnh không được vượt quá 2MB");
                return;
            }

            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                // Add type parameter for entertainment uploads
                formData.append('type', 'entertainment');

                const response = await fetch('/api/upload/image', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();

                if (data.success && data.url) {
                    const imageUrl = data.url;
                    form.setValue('image_url', imageUrl);
                    setImagePreview(imageUrl);
                } else {
                    throw new Error(data.message || 'No URL returned from server');
                }
            } catch (err) {
                console.error('Upload error:', err);
                alert('Upload ảnh thất bại! Vui lòng thử lại');
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div className="container mx-auto p-6 text-dark">
            <h1 className="text-3xl font-bold mb-6">Chỉnh sửa thông tin giải trí</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tiêu đề</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày bắt đầu</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày kết thúc</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Trạng thái</FormLabel>
                                <FormControl>
                                    <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nổi bật</FormLabel>
                                <FormControl>
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image_url"
                        render={() => (
                            <FormItem>
                                <FormLabel>Hình ảnh</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                        disabled={uploading}
                                    />
                                </FormControl>
                                {imagePreview && (
                                    <div className="mt-2">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            width={200}
                                            height={200}
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex space-x-4">
                        <Button type="submit" disabled={loading || uploading}>
                            {loading ? 'Đang cập nhật...' : uploading ? 'Đang upload ảnh...' : 'Cập nhật'}
                        </Button>
                        <Button
                            type="button"
                            variant="custom2"
                            onClick={() => router.back()}
                        >
                            Hủy
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}