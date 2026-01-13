# Hướng dẫn Dark Mode - Sero Chat

## Tính năng mới: Chế độ Tối (Dark Mode)

Ứng dụng Sero Chat giờ đây đã hỗ trợ **Dark Mode** - một tính năng rất hữu ích cho:
- 🌙 Người dùng thức khuya
- 💚 Người mắc chứng trầm cảm hoặc nhạy cảm với ánh sáng
- 🔋 Tiết kiệm pin trên màn hình OLED
- 👀 Giảm mỏi mắt khi sử dụng lâu dài

## Cách sử dụng

### Bật/Tắt Dark Mode
1. Mở ứng dụng và vào **Home Screen**
2. Ở góc trên bên phải, bạn sẽ thấy icon:
   - ☀️ **Mặt trời**: Đang ở chế độ sáng
   - 🌙 **Mặt trăng**: Đang ở chế độ tối
3. Nhấn vào icon để chuyển đổi giữa hai chế độ

### Tính năng
- ✅ Tự động lưu lựa chọn của bạn
- ✅ Duy trì theme khi mở lại ứng dụng
- ✅ Giao diện mượt mà, dễ chịu cho mắt
- ✅ Màu sắc được tối ưu cho từng chế độ

## Màu sắc Theme

### Light Mode (Chế độ Sáng)
- Nền: Xám nhạt (#F5F7FA)
- Card: Trắng (#FFFFFF)
- Text: Đen đậm (#1A202C)
- Primary: Tím xanh (#667EEA)

### Dark Mode (Chế độ Tối)
- Nền: Đen nhẹ (#0F1419)
- Card: Xám đen (#1A202C)
- Text: Trắng nhạt (#F7FAFC)
- Primary: Tím sáng (#7C3AED)

## Kỹ thuật

### Theme Context
- Sử dụng React Context để quản lý theme toàn cục
- Lưu trữ preference vào AsyncStorage
- Hỗ trợ system theme mặc định nếu người dùng chưa chọn

### Files được cập nhật
1. **`src/contexts/ThemeContext.tsx`** (MỚI)
   - Quản lý state dark mode
   - Cung cấp theme colors cho toàn app

2. **`App.tsx`**
   - Wrap ThemeProvider bao quanh AuthProvider

3. **`src/screens/HomeScreen.tsx`**
   - Thêm toggle button trong header
   - Cập nhật tất cả styles để hỗ trợ dynamic colors

## Tương lai

Có thể mở rộng Dark Mode cho các màn hình khác:
- ChatsScreen
- ProfileScreen
- BlogDetailScreen
- Và tất cả các screens khác

## Lợi ích cho người dùng

### Đối với người trầm cảm
- Giảm kích thích thị giác
- Tạo cảm giác thoải mái hơn
- Phù hợp với trạng thái cảm xúc ít năng lượng

### Đối với người thức khuya
- Không gây chói mắt trong bóng tối
- Dễ đọc hơn trong điều kiện ánh sáng yếu
- Giảm tác động đến giấc ngủ (ít blue light)

---

**Lưu ý**: Dark Mode là bước đầu tiên trong việc cải thiện trải nghiệm người dùng. Chúng tôi sẽ tiếp tục tối ưu và mở rộng tính năng này!
