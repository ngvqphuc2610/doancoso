# Hướng dẫn sử dụng trang Admin Quản lý Đặt vé

## Đã khắc phục các vấn đề:

### 1. ✅ Booking Code không lưu được
- **Vấn đề**: Khi booking, booking_code không được lưu vào database
- **Giải pháp**: Đã sửa API `/api/bookings/route.ts` để tự động tạo booking_code nếu không có
- **Kết quả**: Mọi booking giờ đây đều có booking_code duy nhất theo format `CS{timestamp}{random}`

### 2. ✅ Payment Status không cập nhật
- **Vấn đề**: Khi thanh toán thành công, trạng thái không được cập nhật trong database
- **Giải pháp**: 
  - Hoàn thiện API `/api/payment/verify/route.ts` để cập nhật database
  - Hoàn thiện MoMo IPN `/api/payment/momo/ipn/route.ts` để xử lý callback
- **Kết quả**: Payment status và booking status được cập nhật tự động khi thanh toán

### 3. ✅ Trang Admin Quản lý Đặt vé
- **Đường dẫn**: `/admin/bookings`
- **Chức năng đầy đủ**: Tìm kiếm, lọc, edit, delete, bulk operations

## Chức năng của trang Admin Bookings:

### 🔍 Tìm kiếm và Lọc
- **Tìm kiếm**: Theo mã đặt vé, tên khách hàng, email, số điện thoại, tên phim
- **Lọc trạng thái đặt vé**: Tất cả / Chờ xử lý / Đã xác nhận / Đã hủy
- **Lọc trạng thái thanh toán**: Tất cả / Chưa thanh toán / Đã thanh toán / Đã hoàn tiền
- **Lọc theo ngày**: Từ ngày - Đến ngày
- **Nút Tìm kiếm**: Áp dụng bộ lọc
- **Nút Đặt lại**: Xóa tất cả bộ lọc

### 📊 Hiển thị thông tin
- **Desktop**: Bảng với đầy đủ thông tin
- **Mobile**: Card view responsive
- **Thông tin hiển thị**:
  - Mã đặt vé và ngày đặt
  - Thông tin khách hàng (tên, email, phone)
  - Thông tin phim và rạp
  - Lịch chiếu (ngày, giờ)
  - Danh sách ghế đã đặt
  - Tổng tiền
  - Trạng thái đặt vé và thanh toán

### ✏️ Chỉnh sửa từng đặt vé
- **Nút Edit**: Chỉnh sửa trạng thái
- **Có thể thay đổi**:
  - Trạng thái đặt vé: Chờ xử lý / Đã xác nhận / Đã hủy
  - Trạng thái thanh toán: Chưa thanh toán / Đã thanh toán / Đã hoàn tiền
- **Nút Lưu**: Cập nhật thay đổi
- **Nút Hủy**: Hủy bỏ thay đổi

### 🗑️ Xóa đặt vé
- **Nút Delete**: Xóa từng đặt vé
- **Xác nhận**: Hiển thị dialog xác nhận trước khi xóa
- **Xóa cascade**: Tự động xóa các bản ghi liên quan (seats, products, payments)

### 📦 Bulk Operations (Thao tác hàng loạt)
- **Checkbox**: Chọn nhiều đặt vé
- **Select All**: Chọn tất cả đặt vé trên trang hiện tại
- **Bulk Actions**:
  - **Xác nhận**: Cập nhật trạng thái thành "Đã xác nhận"
  - **Hủy**: Cập nhật trạng thái thành "Đã hủy"
  - **Xóa**: Xóa tất cả đặt vé đã chọn
  - **Bỏ chọn**: Hủy chọn tất cả

### 📄 Xuất dữ liệu
- **Nút Xuất CSV**: Tải về file CSV chứa tất cả đặt vé hiện tại
- **Định dạng**: Bao gồm tất cả thông tin quan trọng
- **Tên file**: `bookings_YYYY-MM-DD.csv`

### 📖 Phân trang
- **Hiển thị**: 10 đặt vé mỗi trang
- **Navigation**: Nút Trước/Sau và số trang
- **Thống kê**: Hiển thị số lượng đặt vé hiện tại/tổng số

## API Endpoints đã được tạo:

### GET `/api/admin/bookings`
- Lấy danh sách đặt vé với search/filter
- Hỗ trợ pagination
- Trả về thông tin đầy đủ bao gồm seats và products

### PATCH `/api/admin/bookings`
- Bulk update trạng thái nhiều đặt vé
- Body: `{ bookingIds: number[], booking_status?: string, payment_status?: string }`

### DELETE `/api/admin/bookings`
- Bulk delete nhiều đặt vé
- Body: `{ bookingIds: number[] }`
- Xóa cascade tất cả dữ liệu liên quan

### PATCH `/api/admin/bookings/[id]`
- Update trạng thái một đặt vé
- Body: `{ booking_status?: string, payment_status?: string }`

### DELETE `/api/admin/bookings/[id]`
- Xóa một đặt vé
- Xóa cascade tất cả dữ liệu liên quan

### GET `/api/admin/bookings/[id]`
- Lấy chi tiết một đặt vé
- Bao gồm thông tin seats và products

## Cách sử dụng:

1. **Truy cập**: Đi đến `/admin/bookings`
2. **Tìm kiếm**: Nhập từ khóa vào ô tìm kiếm
3. **Lọc**: Chọn trạng thái và khoảng thời gian
4. **Xem**: Duyệt qua danh sách đặt vé
5. **Chỉnh sửa**: Click nút Edit để thay đổi trạng thái
6. **Xóa**: Click nút Delete để xóa đặt vé
7. **Bulk**: Chọn nhiều đặt vé và thực hiện thao tác hàng loạt
8. **Xuất**: Click "Xuất CSV" để tải về dữ liệu

## Lưu ý:
- Tất cả thao tác đều có xác nhận trước khi thực hiện
- Dữ liệu được cập nhật real-time
- Giao diện responsive, hoạt động tốt trên mobile
- Có xử lý lỗi và hiển thị thông báo phù hợp
