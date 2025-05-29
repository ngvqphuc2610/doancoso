# Test Case: Tính tổng giá tiền khi chọn sản phẩm

## Mục tiêu
Kiểm tra xem hàm `calculateTotalPrice()` có tính đúng tổng giá tiền bao gồm cả sản phẩm được chọn trong phần selection hay không.

## Các bước test

### 1. Truy cập trang chi tiết phim
- Mở trình duyệt và truy cập: http://localhost:3001
- Chọn một phim bất kỳ để xem chi tiết
- Cuộn xuống phần "Lịch Chiếu"

### 2. Chọn suất chiếu
- Chọn ngày chiếu
- Chọn rạp phim
- Chọn suất chiếu
- Chọn loại vé (ví dụ: Người lớn x2)

### 3. Chọn ghế
- Chọn ghế ngồi
- Kiểm tra thanh booking xuất hiện ở cuối trang
- Ghi nhận giá vé hiện tại

### 4. Chọn sản phẩm
- Cuộn xuống phần sản phẩm (Combo, Nước ngọt, v.v.)
- Tăng số lượng một số sản phẩm bằng cách nhấn nút "+"
- Quan sát thay đổi trong thanh booking

### 5. Kiểm tra kết quả
- Giá "Tạm tính" trong thanh booking phải = Giá vé + Giá sản phẩm
- Khi tăng/giảm số lượng sản phẩm, tổng giá phải thay đổi tương ứng
- Khi đặt số lượng sản phẩm về 0, giá sản phẩm phải bị trừ khỏi tổng

## Kết quả mong đợi
✅ Hàm `calculateTotalPrice()` tính đúng tổng giá tiền
✅ Giá cập nhật real-time khi thay đổi số lượng sản phẩm
✅ Không có lỗi React trong console
✅ Dữ liệu được lưu trong localStorage và khôi phục khi reload trang

## Trạng thái hiện tại
✅ **ĐÃ SỬA XONG** - Lỗi "Maximum update depth exceeded" đã được khắc phục
✅ **ĐÃ SỬA XONG** - Lỗi "Cannot update component while rendering" đã được khắc phục
✅ **HOẠT ĐỘNG** - Ứng dụng chạy bình thường trên http://localhost:3001
✅ **SẴN SÀNG** - Có thể test tính năng tính tổng giá tiền
✅ **ĐÃ SỬA XONG** - Vấn đề reset số lượng product khi tải trang

## Test Case: Reset Product Quantities

### Vấn đề đã được giải quyết:
- ❌ **Trước**: Số lượng product không reset khi tải trang mới
- ✅ **Sau**: Product quantities được reset tự động và có nút reset manual

### Các giải pháp đã implement:
1. **Auto reset khi thay đổi movieId** - Reset tự động khi chọn phim khác
2. **Reset prop cho ProductGrid** - Truyền flag để clear localStorage
3. **Manual reset button** - Nút "Xóa tất cả sản phẩm" cho user
4. **useProductSelection hook** - Quản lý reset logic tập trung

### Cách test:
1. Chọn phim → chọn vé → tăng số lượng sản phẩm
2. Reload trang → Kiểm tra số lượng đã reset về 0
3. Chọn phim khác → Kiểm tra số lượng đã reset về 0
4. Nhấn nút "Xóa tất cả sản phẩm" → Kiểm tra số lượng reset về 0

## Cách hoạt động kỹ thuật

### Luồng dữ liệu:
1. ProductGrid → handleIncrease/handleDecrease → onQuantityChange callback
2. MovieShowtimes → handleProductQuantityChange → cập nhật productSelection & productPrices
3. useEffect tính toán totalProductPrice từ productSelection & productPrices
4. calculateTotalPrice() = totalTicketPrice + totalProductPrice
5. Hiển thị trong thanh booking

### Code chính:
```typescript
// MovieShowtimes.tsx
const handleProductQuantityChange = (productId: string, quantity: number, price: number) => {
    setProductSelection(prev => ({ ...prev, [productId]: quantity }));
    setProductPrices(prev => ({ ...prev, [productId]: price }));
};

const calculateTotalPrice = () => {
    return totalTicketPrice + totalProductPrice;
};

// ProductGrid.tsx
const handleIncrease = (productId: string) => {
    // ... cập nhật quantities
    if (onQuantityChange) {
        const product = products.find(p => p.id_product.toString() === productId);
        if (product) {
            onQuantityChange(productId, newQuantity, product.price);
        }
    }
};
```
