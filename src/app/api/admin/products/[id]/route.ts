import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/apiUtils';

// Route để lấy chi tiết một sản phẩm
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        
        // Truy vấn trực tiếp từ database
        const products = await query(`
            SELECT * FROM product WHERE id_product = ?
        `, [id]);
        
        // Kiểm tra nếu không tìm thấy sản phẩm
        if (!products || (Array.isArray(products) && products.length === 0)) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }
        
        // Lấy sản phẩm đầu tiên nếu là mảng
        const product = Array.isArray(products) ? products[0] : products;
        
        return NextResponse.json({
            success: true,
            data: product
        });
    } catch (error: any) {
        console.error(`Error fetching product ${await context.params.then(p => p.id)}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể tải sản phẩm', error: error.message },
            { status: 500 }
        );
    }
}

// Route để cập nhật thông tin sản phẩm
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        
        // Kiểm tra xem sản phẩm có tồn tại không
        const existingProduct = await query(`
            SELECT * FROM product WHERE id_product = ?
        `, [id]);
        
        if (!existingProduct || (Array.isArray(existingProduct) && existingProduct.length === 0)) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }
        
        // Chuẩn bị các trường cần cập nhật
        const updateFields = [];
        const updateValues = [];
        
        // Thêm các trường cần cập nhật
        if (body.product_name) {
            updateFields.push('product_name = ?');
            updateValues.push(body.product_name);
        }
        
        if (body.price !== undefined) {
            updateFields.push('price = ?');
            updateValues.push(body.price);
        }
        
        if (body.description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(body.description);
        }
        
        if (body.image !== undefined) {
            updateFields.push('image = ?');
            updateValues.push(body.image);
        }
        
        if (body.status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(body.status);
        }
        
        // Thêm các trường khác nếu cần
        
        // Nếu không có trường nào cần cập nhật
        if (updateFields.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Không có thông tin nào được cập nhật',
                data: Array.isArray(existingProduct) ? existingProduct[0] : existingProduct
            });
        }
        
        // Thêm ID vào cuối mảng values
        updateValues.push(id);
        
        // Thực hiện cập nhật
        await query(`
            UPDATE product 
            SET ${updateFields.join(', ')}
            WHERE id_product = ?
        `, updateValues);
        
        // Lấy thông tin sản phẩm sau khi cập nhật
        const updatedProduct = await query(`
            SELECT * FROM product WHERE id_product = ?
        `, [id]);
        
        return NextResponse.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: Array.isArray(updatedProduct) ? updatedProduct[0] : updatedProduct
        });
    } catch (error: any) {
        console.error(`Error updating product ${await context.params.then(p => p.id)}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật thông tin sản phẩm', error: error.message },
            { status: 500 }
        );
    }
}

// Route để xóa sản phẩm
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        
        // Kiểm tra xem sản phẩm có tồn tại không
        const existingProduct = await query(`
            SELECT * FROM product WHERE id_product = ?
        `, [id]);
        
        if (!existingProduct || (Array.isArray(existingProduct) && existingProduct.length === 0)) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }
        
        // Kiểm tra xem sản phẩm có đang được sử dụng không (ví dụ: trong đơn hàng)
        // Bạn có thể thêm kiểm tra này nếu cần
        
        // Thực hiện xóa sản phẩm
        await query(`
            DELETE FROM product WHERE id_product = ?
        `, [id]);
        
        return NextResponse.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error: any) {
        console.error(`Error deleting product ${await context.params.then(p => p.id)}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể xóa sản phẩm', error: error.message },
            { status: 500 }
        );
    }
}

// Route để cập nhật trạng thái sản phẩm (PATCH)
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        
        // Kiểm tra xem sản phẩm có tồn tại không
        const existingProduct = await query(`
            SELECT * FROM product WHERE id_product = ?
        `, [id]);
        
        if (!existingProduct || (Array.isArray(existingProduct) && existingProduct.length === 0)) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }
        
        // Kiểm tra xem có trạng thái mới không
        if (body.status === undefined) {
            return NextResponse.json(
                { success: false, message: 'Trạng thái sản phẩm là bắt buộc' },
                { status: 400 }
            );
        }
        
        // Cập nhật trạng thái
        await query(`
            UPDATE product SET status = ? WHERE id_product = ?
        `, [body.status, id]);
        
        // Lấy thông tin sản phẩm sau khi cập nhật
        const updatedProduct = await query(`
            SELECT * FROM product WHERE id_product = ?
        `, [id]);
        
        return NextResponse.json({
            success: true,
            message: 'Cập nhật trạng thái sản phẩm thành công',
            data: Array.isArray(updatedProduct) ? updatedProduct[0] : updatedProduct
        });
    } catch (error: any) {
        console.error(`Error updating product status ${await context.params.then(p => p.id)}:`, error.message);
        return NextResponse.json(
            { success: false, message: 'Không thể cập nhật trạng thái sản phẩm', error: error.message },
            { status: 500 }
        );
    }
}
