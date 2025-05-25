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

const formSchema = z.object({
    product_name: z.string().min(1, "Tên sản phẩm không được để trống"),
    description: z.string().optional(),
    price: z.string().min(1, "Giá không được để trống"),
    image: z.string().optional(),
    id_typeproduct: z.string().min(1, "Loại sản phẩm không được để trống"),
});

interface Product {
    id_product: number;
    id_typeproduct?: number;
    product_name: string;
    description?: string;
    price: number;
    image?: string;
    quantity: number;
    status: 'available' | 'unavailable';
    type_name?: string;
    created_at?: string;
    updated_at?: string;
}

export default function EditProductClient({ product }: { product: Product }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>(product.image || '');
    const [uploading, setUploading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_name: product.product_name,
            description: product.description || "",
            price: product.price.toString(),
            image: product.image || "",
            id_typeproduct: (product.id_typeproduct ?? 1).toString(),
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/products/${product.id_product}`, {
                method: 'PUT',
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
                throw new Error(errorData.message || 'Failed to update product');
            }
        } catch (error) {
            alert(`Lỗi khi cập nhật sản phẩm: ${error instanceof Error ? error.message : 'Đã xảy ra lỗi'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert("Vui lòng chọn file hình ảnh");
                return;
            }

            // Check file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                alert("Kích thước hình ảnh không được vượt quá 2MB");
                return;
            }

            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                // Send file to admin upload API
                const response = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();

                if (data.url) {
                    // Store the full URL for the database
                    const imageUrl = data.url;
                    form.setValue('image', imageUrl);
                    setImagePreview(imageUrl);
                } else {
                    throw new Error('No URL returned from server');
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
            <h1 className="text-3xl font-bold mb-6">Chỉnh sửa sản phẩm</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                    <FormField
                        control={form.control}
                        name="product_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên sản phẩm</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="id_typeproduct"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Loại sản phẩm</FormLabel>
                                <FormControl>
                                    <select
                                        {...field}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Chọn loại sản phẩm</option>
                                        <option value="1">Combo</option>
                                        <option value="2">Nước ngọt</option>
                                        <option value="3">Nước suối & Nước ép</option>
                                        <option value="4">Snacks - Kẹo</option>
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
                            {loading ? 'Đang cập nhật...' : uploading ? 'Đang upload ảnh...' : 'Cập nhật sản phẩm'}
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