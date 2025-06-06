import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Route để lấy danh sách sản phẩm từ database
export async function GET(req: NextRequest) {
    try {
        console.log('[PRODUCTS API] Fetching products from database');

        const result = await query(`
            SELECT
                p.*,
                tp.type_name as product_type_name
            FROM product p
            LEFT JOIN type_product tp ON p.id_typeproduct = tp.id_typeproduct
            ORDER BY p.id_product ASC
        `);

        // Đảm bảo products luôn là mảng
        let products;
        if (Array.isArray(result)) {
            products = result;
        } else if (Array.isArray(result[0])) {
            products = result[0];
        } else {
            products = result && typeof result === 'object' ?
                (Object.keys(result).length > 0 ? [result] : []) :
                (result ? [result] : []);
        }

        console.log('Kết quả truy vấn danh sách sản phẩm:', products);
        console.log('Số lượng sản phẩm:', Array.isArray(products) ? products.length : 0);

        return NextResponse.json({
            success: true,
            data: products
        });
    } catch (error: any) {
        console.error('Error fetching products:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể lấy danh sách sản phẩm',
            error: error.message
        }, { status: 500 });
    }
}

// Route để thêm sản phẩm mới vào database
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.product_name) {
            return NextResponse.json(
                { success: false, message: 'Tên sản phẩm là bắt buộc' },
                { status: 400 }
            );
        }

        if (!body.price) {
            return NextResponse.json(
                { success: false, message: 'Giá sản phẩm là bắt buộc' },
                { status: 400 }
            );
        }

        // Thêm sản phẩm mới vào database
        const result = await query(
            `INSERT INTO product
             (product_name, description, price, image, id_typeproduct)
             VALUES (?, ?, ?, ?, ?)`,
            [
                body.product_name,
                body.description || '',
                body.price,
                body.image || '',
                body.id_typeproduct || 1
            ]
        );

        const resultHeader = Array.isArray(result) ? result[0] : result;
        const productId = (resultHeader as any).insertId;

        return NextResponse.json({
            success: true,
            message: 'Sản phẩm đã được thêm thành công',
            data: { id_product: productId }
        });
    } catch (error: any) {
        console.error('Error creating product:', error.message);

        return NextResponse.json({
            success: false,
            message: 'Không thể thêm sản phẩm mới',
            error: error.message
        }, { status: 500 });
    }
}
