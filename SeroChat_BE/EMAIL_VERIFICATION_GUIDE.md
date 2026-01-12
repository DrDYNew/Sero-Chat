# Email Verification - Hướng dẫn sử dụng

## ✅ Đã hoàn thành

### 1. **Email Service** 
- ✅ Gửi email xác thực khi đăng ký
- ✅ Gửi email chào mừng sau khi verify thành công
- ✅ Template email đẹp mắt với HTML

### 2. **Register Flow**
- Khi user đăng ký:
  - `Status` = "ACTIVE" (mặc định)
  - `IsVerify` = false (mặc định)
  - Gửi email verification tự động
  - Return token để user có thể login ngay

### 3. **Verify Email Endpoint**
- `GET /api/auth/verify-email?token=xxx`
- Khi user click link trong email:
  - Validate token
  - Update `IsVerify` = true
  - Gửi email chào mừng
  - Hiển thị trang success

## 🔧 Cấu hình

### appsettings.json
```json
{
  "EmailSettings": {
    "FromEmail": "dungbd07@gmail.com",
    "FromPassword": "ehgy uwoi idai ruuv",
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587"
  },
  "AppSettings": {
    "BaseUrl": "http://localhost:5000"
  }
}
```

**⚠️ LƯU Ý QUAN TRỌNG:**
- Password đã được format đúng: `ehgy uwoi idai ruuv` (có dấu cách)
- Đây là App Password của Gmail, KHÔNG phải password thường
- Nếu chưa tạo App Password, làm theo hướng dẫn bên dưới

## 📧 Tạo Gmail App Password

### Bước 1: Bật xác thực 2 yếu tố
1. Vào https://myaccount.google.com/security
2. Tìm "2-Step Verification"
3. Bật lên nếu chưa bật

### Bước 2: Tạo App Password
1. Vào https://myaccount.google.com/apppasswords
2. Chọn "Mail" và "Other (Custom name)"
3. Đặt tên: "Sero Chat Backend"
4. Click "Generate"
5. Copy password (16 ký tự, có dấu cách)
6. Paste vào appsettings.json

## 🧪 Test API

### 1. Đăng ký tài khoản mới
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@gmail.com",
  "password": "Test@123456",
  "fullName": "Nguyễn Văn Test",
  "phoneNumber": "0987654321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "userId": 5,
    "email": "test@gmail.com",
    "fullName": "Nguyễn Văn Test",
    "token": "eyJhbGc..."
  }
}
```

### 2. Kiểm tra email
- Vào hộp thư của `test@gmail.com`
- Mở email từ Sero Chat
- Click nút "Xác thực tài khoản"

### 3. Verify email
```bash
GET http://localhost:5000/api/auth/verify-email?token={token_from_email}
```

**Success Response:**
- Hiển thị trang HTML success
- Email chào mừng được gửi tự động

## 📝 Tài khoản test có sẵn

### Account 1 (LOCAL - có password)
```
Email: admin@serochat.com
Password: password123
Status: ACTIVE
IsVerify: true (có thể update thành false để test)
Role: ADMIN
```

### Account 2 (LOCAL - có password)
```
Email: user3@gmail.com
Password: password123
Status: ACTIVE
IsVerify: false
Role: USER
```

**Cách update password trong DB:**
```sql
-- Password = "password123"
UPDATE Users 
SET PasswordHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.fLh6p.'
WHERE Email = 'admin@serochat.com'
```

## 🚀 Chạy Backend

```bash
cd SeroChat_BE
dotnet restore
dotnet run
```

API sẽ chạy tại: `http://localhost:5000`

## 📱 Deep Link

Sau khi verify thành công, trang HTML có link:
```html
<a href='serochat://verified'>Quay lại ứng dụng</a>
```

Bạn cần config deep link trong React Native app để handle `serochat://verified`

## 🔍 Troubleshooting

### Lỗi: "Unable to send email"
- Kiểm tra App Password đã đúng chưa
- Kiểm tra 2-Step Verification đã bật chưa
- Thử tạo lại App Password mới

### Lỗi: "Token không hợp lệ"
- Token có thời hạn 24 giờ
- Kiểm tra SecretKey trong appsettings.json
- Đảm bảo user chưa verify trước đó

### Email không gửi được
- Check logs trong console
- Verify SMTP settings
- Thử gửi email test bằng tool khác

## 📊 Database Schema

```sql
-- Các trường liên quan
Users (
    IsVerify BIT DEFAULT 0,        -- false khi đăng ký, true sau verify
    Status NVARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE, SUSPENDED
    CreatedAt DATETIME DEFAULT GETDATE()
)
```

## 🎯 Flow hoàn chỉnh

1. **User đăng ký** → Status=ACTIVE, IsVerify=false
2. **Backend gửi email** → Email verification với token
3. **User click link** → Verify endpoint
4. **Update DB** → IsVerify=true
5. **Gửi welcome email** → Chào mừng user
6. **User login** → Có thể sử dụng app đầy đủ

---

**✨ Tất cả đã sẵn sàng! Hãy test thử nhé!**
