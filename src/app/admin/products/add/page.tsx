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
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
    product_name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
    description: z.string().optional(),
    price: z.string().min(1, "Giá là bắt buộc"),
    image: z.string().optional(),
    id_typeproduct: z.string().min(1, "Loại sản phẩm là bắt buộc"),
});

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_name: "",
            description: "",
            price: "",
            image: "",
            id_typeproduct: "1",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    price: parseFloat(values.price),
                    id_typeproduct: parseInt(values.id_typeproduct),
                }),
            });

            if (response.ok) {
                router.push('/admin/products');
                router.refresh();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create product');
            }
        } catch (error) {
            alert(`Lỗi khi tạo sản phẩm: ${error instanceof Error ? error.message : 'Đã xảy ra lỗi'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file không được vượt quá 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                const imageUrl = data.url;
                form.setValue('image', imageUrl);
                setImagePreview(imageUrl);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            alert('Lỗi khi upload hình ảnh');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 text-dark">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <h1 className="text-3xl font-bold">Thêm sản phẩm mới</h1>
            </div>

            <div className="max-w-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="product_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên sản phẩm *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên sản phẩm" {...field} />
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
                                        <Textarea
                                            placeholder="Nhập mô tả sản phẩm"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giá (VNĐ) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Nhập giá sản phẩm"
                                            min="0"
                                            step="1000"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="id_typeproduct"
                            render={({ field }) => (
                                <FormItem className='bg-white'>
                                    <FormLabel>Loại sản phẩm *</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="1">Combo</option>
                                            <option value="2">Nước ngọt</option>
                                            <option value="3">Đồ uống</option>
                                            <option value="4">Thức ăn</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="image"
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
                                                alt="Product preview"
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
                                {loading ? 'Đang tạo...' : uploading ? 'Đang upload ảnh...' : 'Tạo sản phẩm'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                            >
                                Hủy
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}