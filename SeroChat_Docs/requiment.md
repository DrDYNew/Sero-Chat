1. ROLE: NGƯỜI DÙNG (USER)
Đây là đối tượng chính sử dụng app để tìm kiếm sự chia sẻ và hỗ trợ tâm lý.
A. Nhóm chức năng Tài khoản & Hệ thống
Đăng nhập bằng Google (Google Sign-In):
Người dùng bấm 1 nút để đăng nhập nhanh, không cần nhớ mật khẩu.
Hệ thống tự động lấy: Tên hiển thị, Ảnh đại diện (Avatar), Email.
Đăng xuất (Logout):
Nằm trong tab Cài đặt.
Xóa phiên đăng nhập, quay về màn hình Login.
Tự động đăng nhập:
Nếu chưa Logout, lần sau mở app sẽ vào thẳng Trang chủ (không cần login lại).
B. Tab 1: Trang chủ (Chat cùng SERO AI)
Gửi tin nhắn: Nhập văn bản và gửi cho SERO.
Nhận phản hồi: Nhận tin nhắn trả lời từ SERO với văn phong tâm lý, thấu cảm.
Lịch sử trò chuyện (Chat History):
Hệ thống tự động lưu lại toàn bộ đoạn chat.
Khi người dùng tắt app mở lại, nội dung cũ vẫn hiển thị (Load từ Server).
Cơ chế phát hiện nguy hiểm (Crisis Intervention - QUAN TRỌNG):
Tự động quét từ khóa: Khi người dùng nhập các từ như: chết, tự tử, suicide, đau khổ quá, muốn kết thúc,...
Hiển thị cảnh báo: Ngay lập tức hiện một thông báo hoặc tin nhắn đặc biệt: "Bạn đang gặp khó khăn? Hãy liên hệ chuyên gia ngay." kèm nút bấm chuyển sang Tab Liên hệ.
Làm mới cuộc trò chuyện (Clear Chat): Nút xóa lịch sử chat để bắt đầu cuộc hội thoại mới (tùy chọn).
C. Tab 2: Liên hệ (Danh bạ Bác sĩ)
Xem danh sách:
Hiển thị danh sách dạng thẻ (Card).
Thông tin hiển thị bên ngoài: Avatar, Tên bác sĩ, Chuyên khoa (Vd: Trầm cảm, Stress).
Xem chi tiết bác sĩ:
Bấm vào thẻ để xem trang chi tiết.
Hiển thị: Ảnh lớn, Mô tả chi tiết kinh nghiệm, Học vấn, Chứng chỉ hành nghề.
Thực hiện liên hệ:
Nút Gọi điện: Bấm vào sẽ tự động mở bàn phím điện thoại và điền số của bác sĩ.
Nút Nhắn tin/Zalo: Bấm vào sẽ mở app Zalo hoặc tin nhắn đến số đó (nếu có).
D. Tab 3: Cài đặt (Settings)
Thông tin cá nhân: Hiển thị Avatar và Tên (lấy từ Google, Read-only).
Chuyển đổi giao diện: Bật/Tắt chế độ tối (Dark Mode) - rất cần thiết cho người trầm cảm hoặc hay thức khuya.
Thông tin pháp lý:
Xem "Chính sách bảo mật" (Privacy Policy).
Xem "Điều khoản sử dụng" (Terms of Service).
Xem "Tuyên bố miễn trừ trách nhiệm" (Disclaimer - App không phải là bác sĩ).

2. ROLE: QUẢN TRỊ VIÊN (ADMIN)
Admin là người quản lý nội dung, đảm bảo thông tin bác sĩ luôn chính xác. Admin có thể dùng chung App (nhưng có quyền cao hơn) hoặc dùng một trang Web quản trị riêng (Web Dashboard). Dưới đây là chức năng nếu tích hợp chung vào App.
A. Nhóm chức năng Quản trị Bác sĩ (CRUD)
Đây là chức năng quan trọng nhất của Admin.
Thêm Bác sĩ mới (Create):
Form nhập liệu gồm:
Tên hiển thị (Vd: Ths. BS Nguyễn Văn A).
Chuyên ngành (Vd: Tâm lý học lâm sàng).
Số điện thoại liên hệ.
Link liên kết (Zalo/Facebook/Website).
Mô tả kinh nghiệm (Text dài).
Upload ảnh: Chọn ảnh từ thư viện máy -> Upload lên Server -> Lấy link ảnh hiển thị.
Xem danh sách (Read):
Giống người dùng, nhưng trên mỗi thẻ bác sĩ sẽ có thêm nút "Sửa" và "Xóa".
Chỉnh sửa thông tin (Update):
Bấm vào một bác sĩ -> Hiện lại form đã điền thông tin cũ.
Cho phép sửa lại SĐT (nếu đổi số), cập nhật lại kinh nghiệm, đổi ảnh đại diện mới.
Xóa Bác sĩ (Delete):
Xóa bác sĩ khỏi danh sách hiển thị của người dùng (Soft delete hoặc Hard delete).
Có popup xác nhận: "Bạn có chắc chắn muốn xóa bác sĩ này không?" để tránh bấm nhầm.



CÁC TÍNH NĂNG CÓ THỂ THÊM : 
Giai đoạn 2: Tính năng tăng trải nghiệm
1. Nhật ký cảm xúc (Mood Tracker) - Rất phổ biến & Hữu ích
Thay vì chỉ chat, hãy cho người dùng một nơi để ghi lại cảm xúc mỗi ngày.
Chức năng:
Mỗi ngày mở app, hiện một popup: "Hôm nay bạn cảm thấy thế nào?"
Người dùng chọn Icon: Vui 😄, Bình thường 😐, Buồn 😔, Tức giận 😡...
Có thể viết thêm note ngắn (Vd: "Hôm nay bị sếp mắng").
Hiển thị:
Vẽ biểu đồ (Chart) theo tuần/tháng để người dùng thấy biểu đồ tâm trạng của mình đang đi lên hay đi xuống.
Giá trị: Giúp người dùng tự nhận thức (self-awareness) về sức khỏe tinh thần của mình.
2. Góc thư giãn (Relax Zone)
Khi người dùng đang căng thẳng nhưng chưa muốn chat, họ cần công cụ để bình tĩnh lại ngay lập tức.
Chức năng:
Bài tập hít thở: Một vòng tròn to/nhỏ trên màn hình hướng dẫn: "Hít vào (4s) - Giữ (4s) - Thở ra (4s)".
Âm nhạc chữa lành: List nhạc không lời (Tiếng mưa, tiếng rừng, tiếng sóng biển, lo-fi...) tích hợp sẵn trong app.
Kỹ thuật: Chỉ cần play file MP3 và hiệu ứng animation đơn giản.
3. Thông điệp mỗi ngày (Daily Affirmations)
Chức năng:
Mỗi sáng (ví dụ 7:00 AM), App gửi 1 thông báo (Notification) hoặc hiện ngay trang chủ một câu nói tích cực.
Vd: "Bạn đã làm rất tốt rồi, hãy yêu thương bản thân nhé.", "Mọi chuyện rồi sẽ ổn thôi."
Admin: Có thể thêm danh sách các câu nói này.
Giai đoạn 4: Tính năng Cộng đồng & Kiếm tiền (Monetization)
6. Gói Premium (SERO Plus)
Nếu bạn muốn kiếm tiền để duy trì server/API key:
Free: Chat giới hạn số tin nhắn/ngày, nghe nhạc cơ bản.
Premium: Chat không giới hạn, mở khóa toàn bộ kho nhạc thiền, tắt quảng cáo, xem biểu đồ cảm xúc nâng cao.
Thanh toán: Tích hợp MoMo hoặc Google In-App Purchase.
7. Blog/Kiến thức (Psychoeducation)
Admin: Viết bài đăng về kiến thức tâm lý (Vd: "5 cách vượt qua chia tay", "Dấu hiệu của Burnout").
Người dùng: Đọc, lưu bài viết, chia sẻ bài viết.
SERO AI: Khi chat, nếu người dùng hỏi vấn đề liên quan, SERO có thể gửi link bài viết trong app cho người dùng đọc.

