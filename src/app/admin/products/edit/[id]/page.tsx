// app/admin/products/edit/[id]/page.tsx
import { getProductById } from '@/lib/productDb';
import EditProductClient from './EditProductClient';
import { Product } from '@/lib/types/database';
import { query } from '@/lib/db';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductById(parseInt(id));

    if (!product) {
        return <div className="p-6 text-red-500">Không tìm thấy sản phẩm</div>;
    }

    return <EditProductClient product={product} />;
}
