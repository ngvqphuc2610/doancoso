# 📧 Cấu hình Email cho tính năng Forgot Password

## 🎯 Mục đích của reset_token và reset_token_expiry

### **reset_token**
- **Mục đích**: Lưu mã token ngẫu nhiên (32 bytes hex) để xác thực yêu cầu đặt lại mật khẩu
- **Bảo mật**: Token được tạo bằng `crypto.randomBytes()` - không thể đoán được
- **Sử dụng**: Chỉ dùng 1 lần và bị xóa sau khi đặt lại mật khẩu thành công

### **reset_token_expiry**
- **Mục đích**: Lưu thời gian hết hạn của token (mặc định 1 giờ)
- **Bảo mật**: Tự động vô hiệu hóa token sau thời gian quy định
- **Format**: DATETIME trong MySQL

## 🔄 Quy trình hoạt động

```
1. User nhập email → API tạo reset_token + expiry
2. Lưu vào DB → Gửi email chứa link reset
3. User click link → Kiểm tra token hợp lệ & chưa hết hạn  
4. Đặt lại mật khẩu → Xóa token khỏi DB
```

## ⚙️ Cấu hình Email

### **1. Tạo App Password cho Gmail:**

1. **Bật 2-Step Verification:**
   - Vào [Google Account Security](https://myaccount.google.com/security)
   - Bật "2-Step Verification"

2. **Tạo App Password:**
   - Vào "App passwords" 
   - Chọn "Mail" và "Other"
   - Nhập tên: "CineStar Reset Password"
   - Copy mật khẩu 16 ký tự

### **2. Cập nhật file .env:**

```env
# Email Configuration
EMAIL=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-digit-app-password

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### **3. Cấu hình cho production:**

```env
# Production
EMAIL=support@cinestar.com
EMAIL_APP_PASSWORD=production-app-password
NEXT_PUBLIC_BASE_URL=https://cinestar.com
```

## 🧪 Test Email

### **1. Test với email có trong DB:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### **2. Kiểm tra email nhận được:**
- Subject: "Đặt lại mật khẩu - CineStar"
- Có nút "Đặt lại mật khẩu" 
- Link có format: `/reset-password?token=...`

### **3. Test reset password:**
- Click link trong email
- Nhập mật khẩu mới
- Verify đăng nhập với mật khẩu mới

## 🔒 Bảo mật

### **Token Security:**
- ✅ Random 32-byte hex string
- ✅ Hết hạn sau 1 giờ
- ✅ Chỉ sử dụng 1 lần
- ✅ Tự động xóa sau khi dùng

### **Email Security:**
- ✅ HTML template với styling
- ✅ Hiển thị tên user
- ✅ Cảnh báo bảo mật
- ✅ Link có thời hạn

### **API Security:**
- ✅ Validate email format
- ✅ Check user exists & active
- ✅ Rate limiting (có thể thêm)
- ✅ Error handling

## 🚀 Tính năng nâng cao

### **1. Rate Limiting:**
```javascript
// Giới hạn 3 lần/15 phút cho mỗi email
const attempts = await redis.get(`reset_attempts:${email}`);
if (attempts >= 3) {
  return error('Too many attempts');
}
```

### **2. Email Queue:**
```javascript
// Sử dụng Bull Queue cho email
await emailQueue.add('forgot-password', {
  email, resetUrl, userName
});
```

### **3. SMS Backup:**
```javascript
// Gửi SMS nếu email fail
if (emailFailed && user.phone) {
  await sendSMS(user.phone, `Reset code: ${shortCode}`);
}
```

## 📱 UI/UX

### **Forgot Password Page:**
- ✅ Email input với validation
- ✅ Loading state
- ✅ Success message
- ✅ Error handling
- ✅ Link quay lại login

### **Reset Password Page:**
- ✅ Token validation
- ✅ Password strength meter
- ✅ Confirm password
- ✅ Show/hide password
- ✅ Success redirect

### **Login Enhancement:**
- ✅ "Lưu mật khẩu" checkbox
- ✅ Auto-fill saved credentials
- ✅ Link "Quên mật khẩu"

## 🎨 Email Template Features

- 📱 **Responsive design**
- 🎨 **Brand colors & logo**
- 🔐 **Security warnings**
- 📋 **Clear instructions**
- 🔗 **Fallback text link**
- ⏰ **Expiry information**
