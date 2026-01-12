# Frontend Updates - Email Verification & Registration

## ✅ Đã cập nhật

### 1. **RegisterScreen.tsx** (MỚI)
- ✅ Form đăng ký đầy đủ với validation
- ✅ Các trường: Họ tên, Email, SĐT, Mật khẩu, Xác nhận mật khẩu
- ✅ Checkbox đồng ý điều khoản
- ✅ Validation mật khẩu mạnh (chữ hoa + số)
- ✅ UI đẹp mắt với gradient
- ✅ Thông báo về email verification sau khi đăng ký thành công

### 2. **LoginScreen.tsx** (CẬP NHẬT)
- ✅ Thêm link "Đăng ký ngay" chuyển đến RegisterScreen
- ✅ Navigation hoạt động đúng

### 3. **App.tsx** (CẬP NHẬT)
- ✅ Thêm RegisterScreen vào navigation stack

### 4. **authService.ts** (ĐÃ CÓ SẴN)
- ✅ Đã có sẵn method `register()`
- ✅ Tự động lưu token vào AsyncStorage sau khi register

## 🎨 UI Features

### RegisterScreen
```
📱 Giao diện:
- Header gradient với logo
- Back button để quay lại Login
- Form fields với icons
- Password strength hint
- Checkbox terms & conditions
- Loading state
- Error messages
- Success alert với thông tin về email verification
```

### Flow đăng ký
```
1. User điền form → Validate
2. Call API register → Backend xử lý
3. Backend gửi email verification
4. Return token → Lưu vào AsyncStorage
5. Hiển thị alert thành công
6. Navigate to Home (user có thể dùng app ngay)
7. User check email → Click link verify
8. IsVerify = true → Nhận welcome email
```

## 🧪 Test Flow

### Test đăng ký tài khoản mới

1. **Mở app → Home Screen**
2. **Click "Đăng nhập" → LoginScreen**
3. **Click "Đăng ký ngay" → RegisterScreen**
4. **Điền thông tin:**
   ```
   Họ tên: Nguyễn Văn Test
   Email: test@gmail.com
   SĐT: 0987654321
   Mật khẩu: Test@123
   Xác nhận: Test@123
   ✓ Đồng ý điều khoản
   ```
5. **Click "Đăng ký"**
6. **Alert xuất hiện:**
   ```
   ✅ Đăng ký thành công!
   
   Chúng tôi đã gửi email xác thực đến test@gmail.com. 
   Vui lòng kiểm tra hộp thư và click vào link để kích hoạt tài khoản.
   
   Bạn vẫn có thể sử dụng ứng dụng ngay bây giờ!
   ```
7. **Click OK → Chuyển về Home**
8. **Kiểm tra email → Click link verify**
9. **Browser mở → Hiển thị trang success**

## 📝 Validation Rules

### Họ tên
- ✅ Bắt buộc
- ✅ Không được để trống

### Email
- ✅ Bắt buộc
- ✅ Format email hợp lệ

### Số điện thoại
- ⚪ Không bắt buộc
- ✅ Nếu nhập phải đúng 10 số

### Mật khẩu
- ✅ Bắt buộc
- ✅ Ít nhất 6 ký tự
- ✅ Có ít nhất 1 chữ hoa
- ✅ Có ít nhất 1 số
- 💡 Hint: "Mật khẩu mạnh: ít nhất 6 ký tự, có chữ hoa, số"

### Xác nhận mật khẩu
- ✅ Bắt buộc
- ✅ Phải khớp với mật khẩu

### Điều khoản
- ✅ Bắt buộc phải check

## 🔧 Cấu hình

Đảm bảo `authService.ts` đã config đúng IP:

```typescript
const API_BASE_URL = 'http://192.168.1.209:5000/api';
// Hoặc IP máy tính của bạn
```

## 🚀 Chạy Frontend

```bash
cd SeroChat_FE
npm install
npx expo start
```

Scan QR code bằng Expo Go (Android) hoặc Camera (iOS)

## 📱 Deep Link (Tương lai)

Để handle link từ email về app, cần config:

### app.json
```json
{
  "expo": {
    "scheme": "serochat",
    "ios": {
      "associatedDomains": ["applinks:serochat.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "serochat",
              "host": "*"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Linking setup
```typescript
// App.tsx
import * as Linking from 'expo-linking';

const linking = {
  prefixes: ['serochat://', 'https://serochat.com'],
  config: {
    screens: {
      Home: 'home',
      VerifySuccess: 'verified',
    },
  },
};

<NavigationContainer linking={linking}>
  ...
</NavigationContainer>
```

## 🎯 Features đã hoàn thành

- ✅ Register UI/UX
- ✅ Form validation
- ✅ API integration
- ✅ Error handling
- ✅ Loading states
- ✅ Navigation flow
- ✅ Email verification notification

## 📊 Screenshot Flow

```
LoginScreen
    |
    | [Đăng ký ngay]
    ↓
RegisterScreen
    |
    | [Điền form]
    | [Click Đăng ký]
    ↓
Alert: Đăng ký thành công + thông báo check email
    |
    | [Click OK]
    ↓
Home Screen (Đã login)
    |
    | User check email
    ↓
Click link trong email
    |
    ↓
Browser: Trang xác thực thành công
    |
    | [Quay lại ứng dụng] (deep link)
    ↓
App: Đã verified
```

---

**✨ Frontend đã sẵn sàng! Test thử nhé!**

## 🐛 Troubleshooting

### Lỗi "Cannot connect to server"
- Kiểm tra backend đang chạy
- Kiểm tra IP trong authService.ts
- Kiểm tra cùng mạng WiFi

### Navigation không hoạt động
- Restart Expo
- Check import RegisterScreen trong App.tsx

### Form không submit
- Check console logs
- Verify validation rules
- Check API response

---

**📧 Liên hệ support nếu cần hỗ trợ!**
