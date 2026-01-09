CREATE DATABASE SeroChat
GO
USE SeroChat
GO
-- =============================================================
-- 1. NGƯỜI DÙNG CHI TIẾT (Profile nâng cao)
-- =============================================================
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(150) UNIQUE NOT NULL,
    password_hash NVARCHAR(MAX) NULL,            -- NULLABLE cho Google Sign-In
    google_id NVARCHAR(255) NULL,                -- Google User ID (không UNIQUE vì cho phép nhiều NULL)
    auth_provider NVARCHAR(20) DEFAULT 'LOCAL' CHECK (auth_provider IN ('LOCAL', 'GOOGLE')),
    full_name NVARCHAR(100),
    phone_number VARCHAR(15),
    gender NVARCHAR(20) CHECK (gender IN (N'Nam', N'Nữ', N'Khác')),
    date_of_birth DATE,
    avatar_url NVARCHAR(MAX),
    role NVARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),  -- Phân quyền
    subscription_status NVARCHAR(20) DEFAULT 'FREE' CHECK (subscription_status IN ('FREE', 'PREMIUM')),
    premium_expiry DATETIME NULL,
    theme NVARCHAR(20) DEFAULT 'LIGHT' CHECK (theme IN ('LIGHT', 'DARK')),  -- Dark Mode
    language NVARCHAR(10) DEFAULT 'vi' CHECK (language IN ('vi', 'en')),
    status NVARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    is_verify BIT DEFAULT 0,         -- Email verification status
    is_deleted BIT DEFAULT 0,        -- Soft delete
    created_at DATETIME DEFAULT GETDATE()
);

-- =============================================================
-- 2. HỆ THỐNG GÓI CƯỚC & THANH TOÁN (PAYOS)
-- =============================================================
CREATE TABLE Subscription_Plans (
    plan_id INT PRIMARY KEY IDENTITY(1,1),
    plan_name NVARCHAR(100) NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    duration_days INT NOT NULL,       -- Vd: 30, 365
    daily_message_limit INT DEFAULT 20 -- Giới hạn tin nhắn Free/VIP
);

CREATE TABLE Transactions (
    order_code BIGINT PRIMARY KEY,    -- Mã đơn hàng payOS (Số)
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    status NVARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Trans_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Trans_Plan FOREIGN KEY (plan_id) REFERENCES Subscription_Plans(plan_id)
);

-- =============================================================
-- 3. QUẢN LÝ CHUYÊN KHOA & BÁC SĨ (CHUẨN HÓA)
-- =============================================================
CREATE TABLE Specialties (
    specialty_id INT PRIMARY KEY IDENTITY(1,1),
    specialty_name NVARCHAR(100) UNIQUE NOT NULL, -- Vd: Tâm lý lâm sàng, Nhãn khoa, Tai Mũi Họng...
    description NVARCHAR(500)
);

CREATE TABLE Doctors (
    doctor_id INT PRIMARY KEY IDENTITY(1,1),
    specialty_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    experience_years INT DEFAULT 0,
    phone VARCHAR(20),
    zalo_url NVARCHAR(MAX),
    address NVARCHAR(255),
    bio_detail NVARCHAR(MAX),
    image_url NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    is_deleted BIT DEFAULT 0,        -- Soft delete
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Doctor_Specialty FOREIGN KEY (specialty_id) REFERENCES Specialties(specialty_id)
);

-- Bảng Chứng chỉ/Bằng cấp của Bác sĩ (Admin upload nhiều ảnh)
CREATE TABLE Doctor_Certificates (
    cert_id INT PRIMARY KEY IDENTITY(1,1),
    doctor_id INT NOT NULL,
    certificate_name NVARCHAR(200),   -- Vd: "Chứng chỉ hành nghề", "Bằng Thạc sĩ"
    image_url NVARCHAR(MAX) NOT NULL,
    uploaded_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Cert_Doctor FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

-- =============================================================
-- 4. BLOGS & KIẾN THỨC (Cơ cấu danh mục - bài viết)
-- =============================================================
CREATE TABLE Blog_Categories (
    blog_cat_id INT PRIMARY KEY IDENTITY(1,1),
    category_name NVARCHAR(100) UNIQUE NOT NULL, -- Vd: Stress, Trầm cảm, Kỹ năng sống...
    description NVARCHAR(500)
);

CREATE TABLE Blogs (
    blog_id INT PRIMARY KEY IDENTITY(1,1),
    blog_cat_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,      -- Nội dung dạng HTML/Markdown
    thumbnail_url NVARCHAR(MAX),
    author_name NVARCHAR(100) DEFAULT N'SERO Team',
    is_deleted BIT DEFAULT 0,            -- Soft delete
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Blog_Category FOREIGN KEY (blog_cat_id) REFERENCES Blog_Categories(blog_cat_id)
);

-- Bảng Lưu bài viết (User bookmark blog)
CREATE TABLE Saved_Blogs (
    saved_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    blog_id INT NOT NULL,
    saved_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_SavedBlog_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_SavedBlog_Blog FOREIGN KEY (blog_id) REFERENCES Blogs(blog_id),
    CONSTRAINT UQ_User_Blog UNIQUE (user_id, blog_id)  -- Không lưu trùng
);

-- =============================================================
-- 5. RELAX ZONE (Âm nhạc & Bài tập thở)
-- =============================================================
CREATE TABLE Relax_Assets (
    asset_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(100) NOT NULL,
    type NVARCHAR(20) CHECK (type IN ('MUSIC', 'BREATHING', 'MEDITATION')),
    media_url NVARCHAR(MAX) NOT NULL,
    thumbnail_url NVARCHAR(MAX),
    is_premium BIT DEFAULT 0,            -- VIP mới được dùng
    is_deleted BIT DEFAULT 0,            -- Soft delete
    created_at DATETIME DEFAULT GETDATE()
);

-- =============================================================
-- 6. HỆ THỐNG CHAT & CẢNH BÁO NGUY HIỂM (AI DRIVEN)
-- =============================================================
CREATE TABLE Conversations (
    conv_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    title NVARCHAR(255) DEFAULT N'Cuộc trò chuyện mới',
    is_deleted BIT DEFAULT 0,            -- Soft delete (Clear Chat)
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Conv_User FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Messages (
    msg_id INT PRIMARY KEY IDENTITY(1,1),
    conv_id INT NOT NULL,
    sender_type NVARCHAR(10) CHECK (sender_type IN ('USER', 'SERO')),
    content NVARCHAR(MAX) NOT NULL,
    is_crisis_detected BIT DEFAULT 0,    -- AI trả về flag này
    is_deleted BIT DEFAULT 0,            -- Soft delete
    sent_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Msg_Conv FOREIGN KEY (conv_id) REFERENCES Conversations(conv_id)
);

-- Bảng Log riêng cho Admin quản lý các tin nhắn báo động
CREATE TABLE Crisis_Alert_Logs (
    alert_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    msg_id INT,
    alert_time DATETIME DEFAULT GETDATE(),
    is_resolved BIT DEFAULT 0,
    CONSTRAINT FK_Alert_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Alert_Msg FOREIGN KEY (msg_id) REFERENCES Messages(msg_id)
);

-- =============================================================
-- 7. TIỆN ÍCH KHÁC (Mood, Notify, Affirmations)
-- =============================================================
CREATE TABLE Mood_Logs (
    log_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    mood_score INT CHECK (mood_score BETWEEN 1 AND 5),
    note NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Mood_User FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Notifications (
    notify_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    title NVARCHAR(200),
    content NVARCHAR(MAX),
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Notify_User FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Daily_Affirmations (
    aff_id INT PRIMARY KEY IDENTITY(1,1),
    content NVARCHAR(MAX) NOT NULL,
    is_deleted BIT DEFAULT 0,            -- Soft delete
    created_at DATETIME DEFAULT GETDATE()
);

-- =============================================================
-- 8. BẢNG PHỤ THÊM (User Preferences & Activity Tracking)
-- =============================================================
-- Bảng theo dõi lịch sử đọc Blog (để gợi ý nội dung tương tự)
CREATE TABLE Blog_Read_History (
    read_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    blog_id INT NOT NULL,
    read_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ReadHistory_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_ReadHistory_Blog FOREIGN KEY (blog_id) REFERENCES Blogs(blog_id)
);

-- =============================================================
-- 9. DỮ LIỆU MẪU (SAMPLE DATA)
-- =============================================================

-- 9.1. Users mẫu
INSERT INTO Users (email, password_hash, google_id, auth_provider, full_name, phone_number, gender, date_of_birth, avatar_url, role, subscription_status, theme, language) VALUES
(N'admin@serochat.com', N'$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.fLh6p.', NULL, 'LOCAL', N'SERO Admin', '0901234567', N'Khác', '1990-01-01', 'https://i.pravatar.cc/150?img=1', 'ADMIN', 'PREMIUM', 'LIGHT', 'vi'),
(N'user1@gmail.com', NULL, 'google_12345678', 'GOOGLE', N'Nguyễn Văn An', '0987654321', N'Nam', '1995-05-15', 'https://i.pravatar.cc/150?img=11', 'USER', 'FREE', 'DARK', 'vi'),
(N'user2@gmail.com', NULL, 'google_87654321', 'GOOGLE', N'Trần Thị Bình', '0976543210', N'Nữ', '1998-08-20', 'https://i.pravatar.cc/150?img=25', 'USER', 'PREMIUM', 'LIGHT', 'vi'),
(N'user3@gmail.com', N'$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.fLh6p.', NULL, 'LOCAL', N'Lê Minh Cường', NULL, N'Nam', '1992-03-10', 'https://i.pravatar.cc/150?img=33', 'USER', 'FREE', 'DARK', 'vi');

-- 9.2. Gói cước
INSERT INTO Subscription_Plans (plan_name, price, duration_days, daily_message_limit) VALUES
(N'SERO Free', 0, 365, 20),
(N'SERO Plus - Tháng', 49000, 30, 999),
(N'SERO Plus - Năm', 499000, 365, 999);

-- 9.3. Chuyên khoa
INSERT INTO Specialties (specialty_name, description) VALUES
(N'Tâm lý lâm sàng', N'Chuyên về rối loạn tâm lý, trầm cảm, lo âu'),
(N'Tâm lý trẻ em', N'Tâm lý học phát triển và hành vi trẻ em'),
(N'Tâm lý gia đình', N'Tư vấn hôn nhân, gia đình và các mối quan hệ'),
(N'Tâm lý nghề nghiệp', N'Stress công việc, burnout, định hướng nghề nghiệp');

-- 9.4. Bác sĩ mẫu
INSERT INTO Doctors (specialty_id, name, experience_years, phone, zalo_url, address, bio_detail, image_url, is_active) VALUES
(1, N'Ths. BS Nguyễn Văn Minh', 8, '0912345678', 'https://zalo.me/0912345678', N'Bệnh viện Tâm thần Trung ương, Hà Nội', N'Chuyên gia về trầm cảm và rối loạn lo âu. Từng công tác tại Viện Tâm lý học Việt Nam. Có hơn 8 năm kinh nghiệm điều trị và tư vấn tâm lý.', 'https://i.pravatar.cc/300?img=12', 1),
(2, N'ThS. Trần Thị Hương', 5, '0923456789', 'https://zalo.me/0923456789', N'Trung tâm Tâm lý Hà Nội', N'Chuyên gia tâm lý trẻ em với 5 năm kinh nghiệm. Tốt nghiệp Thạc sĩ Tâm lý học tại ĐH Quốc gia Hà Nội.', 'https://i.pravatar.cc/300?img=47', 1),
(3, N'TS. Lê Hoàng Nam', 12, '0934567890', 'https://zalo.me/0934567890', N'Phòng khám Tâm lý An Nhiên, TP.HCM', N'Tiến sĩ Tâm lý học, chuyên về tư vấn hôn nhân và gia đình. Có hơn 12 năm kinh nghiệm giảng dạy và thực hành lâm sàng.', 'https://i.pravatar.cc/300?img=68', 1),
(4, N'Ths. Phạm Thị Lan', 6, '0945678901', 'https://zalo.me/0945678901', N'Công ty Tư vấn Tâm lý MindCare, Đà Nẵng', N'Chuyên gia về stress công việc và hội chứng burnout. Tư vấn cho nhiều doanh nghiệp lớn về sức khỏe tinh thần nhân viên.', 'https://i.pravatar.cc/300?img=20', 1);

-- 9.5. Chứng chỉ bác sĩ
INSERT INTO Doctor_Certificates (doctor_id, certificate_name, image_url) VALUES
(1, N'Chứng chỉ hành nghề Tâm lý lâm sàng', 'https://via.placeholder.com/600x400/4CAF50/FFFFFF?text=Certificate+1'),
(1, N'Bằng Thạc sĩ Tâm lý học', 'https://via.placeholder.com/600x400/2196F3/FFFFFF?text=Master+Degree'),
(2, N'Chứng chỉ Tâm lý trẻ em', 'https://via.placeholder.com/600x400/FF9800/FFFFFF?text=Child+Psychology'),
(3, N'Bằng Tiến sĩ Tâm lý học', 'https://via.placeholder.com/600x400/9C27B0/FFFFFF?text=PhD+Psychology');

-- 9.6. Danh mục Blog
INSERT INTO Blog_Categories (category_name, description) VALUES
(N'Trầm cảm', N'Kiến thức về trầm cảm, dấu hiệu và cách đối phó'),
(N'Lo âu & Stress', N'Quản lý căng thẳng và lo lắng trong cuộc sống'),
(N'Kỹ năng sống', N'Phát triển bản thân và kỹ năng mềm'),
(N'Tình yêu & Gia đình', N'Mối quan hệ và tâm lý gia đình'),
(N'Sức khỏe tinh thần', N'Chăm sóc và duy trì sức khỏe tâm lý');

-- 9.7. Bài viết Blog
INSERT INTO Blogs (blog_cat_id, title, content, thumbnail_url, author_name) VALUES
(1, N'5 dấu hiệu nhận biết trầm cảm sớm', N'<h2>Trầm cảm là gì?</h2><p>Trầm cảm là một rối loạn tâm trạng phổ biến, gây ra cảm giác buồn bã kéo dài và mất hứng thú với các hoạt động...</p><h3>Các dấu hiệu cảnh báo:</h3><ul><li>Buồn bã kéo dài hơn 2 tuần</li><li>Mất ngủ hoặc ngủ quá nhiều</li><li>Cảm giác tội lỗi, vô giá trị</li><li>Khó tập trung</li><li>Có ý nghĩ tự hủy hoại</li></ul>', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', N'BS. Nguyễn Văn Minh'),
(2, N'7 cách giảm stress hiệu quả mỗi ngày', N'<h2>Stress trong cuộc sống hiện đại</h2><p>Cuộc sống ngày càng bận rộn khiến stress trở thành vấn đề phổ biến...</p><h3>Các phương pháp:</h3><ol><li>Thiền và hít thở sâu</li><li>Tập thể dục đều đặn</li><li>Ngủ đủ giấc</li><li>Kết nối với người thân</li><li>Viết nhật ký</li><li>Nghe nhạc thư giãn</li><li>Giảm caffeine</li></ol>', 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800', N'ThS. Trần Thị Hương'),
(3, N'Làm thế nào để nói "Không" mà không cảm thấy tội lỗi', N'<h2>Kỹ năng từ chối</h2><p>Nhiều người gặp khó khăn khi từ chối yêu cầu của người khác vì sợ làm mất lòng...</p><p>Học cách đặt ranh giới là rất quan trọng cho sức khỏe tinh thần.</p>', 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800', N'SERO Team'),
(4, N'Làm gì khi cãi nhau với người yêu?', N'<h2>Xung đột trong mối quan hệ</h2><p>Cãi vã là điều bình thường, nhưng cách giải quyết mới là điều quan trọng...</p><ul><li>Lắng nghe không tranh luận</li><li>Sử dụng "tôi cảm thấy" thay vì "bạn luôn luôn"</li><li>Chọn thời điểm phù hợp để nói chuyện</li><li>Tránh đào lại chuyện cũ</li></ul>', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800', N'TS. Lê Hoàng Nam'),
(5, N'Self-care: Chăm sóc bản thân không phải là ích kỷ', N'<h2>Tại sao self-care quan trọng?</h2><p>Trong xã hội hiện đại, nhiều người quên chăm sóc bản thân vì bận rộn với công việc và người khác...</p><p>Nhưng bạn không thể rót từ một chiếc cốc rỗng. Hãy chăm sóc bản thân trước khi chăm sóc người khác.</p>', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', N'SERO Team');

-- 9.8. Relax Assets (Nhạc & Bài tập)
INSERT INTO Relax_Assets (title, type, media_url, thumbnail_url, is_premium) VALUES
(N'Tiếng mưa rơi nhẹ nhàng', 'MUSIC', 'https://example.com/audio/rain.mp3', 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=400', 0),
(N'Sóng biển êm dịu', 'MUSIC', 'https://example.com/audio/ocean.mp3', 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400', 0),
(N'Lo-fi chill beats', 'MUSIC', 'https://example.com/audio/lofi.mp3', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', 1),
(N'Âm thanh rừng nhiệt đới', 'MUSIC', 'https://example.com/audio/forest.mp3', 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400', 1),
(N'Bài tập thở 4-7-8', 'BREATHING', 'https://example.com/video/breathing-4-7-8.mp4', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', 0),
(N'Thiền mindfulness 10 phút', 'MEDITATION', 'https://example.com/audio/meditation-10min.mp3', 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400', 1);

-- 9.9. Câu nói tích cực (Daily Affirmations)
INSERT INTO Daily_Affirmations (content) VALUES
(N'Hôm nay sẽ là một ngày tuyệt vời. Mình xứng đáng được yêu thương và hạnh phúc.'),
(N'Mình không cần phải hoàn hảo. Mình chỉ cần cố gắng hết sức mình.'),
(N'Cảm xúc của mình là hợp lệ. Mình được phép cảm thấy những gì mình đang cảm thấy.'),
(N'Mọi chuyện rồi sẽ ổn thôi. Mình đã vượt qua nhiều khó khăn rồi, lần này cũng vậy.'),
(N'Mình tự hào về những gì mình đã làm được. Dù nhỏ hay lớn, đó đều là tiến bộ.'),
(N'Hãy yêu thương bản thân như cách mình yêu thương những người mình quý.'),
(N'Không sao nếu hôm nay mình không làm được nhiều. Nghỉ ngơi cũng là năng suất.'),
(N'Mình đang trên hành trình của riêng mình. Không cần so sánh với người khác.'),
(N'Chấp nhận bản thân là bước đầu tiên để thay đổi. Mình đang làm tốt lắm rồi.'),
(N'Mỗi ngày là một cơ hội mới để bắt đầu lại. Hãy thử một lần nữa nhé!');

-- 9.10. Conversations & Messages mẫu
INSERT INTO Conversations (user_id, title) VALUES
(2, N'Cuộc trò chuyện với SERO - 08/01/2026'),
(3, N'Tâm sự về công việc'),
(4, N'Chia sẻ về gia đình');

INSERT INTO Messages (conv_id, sender_type, content, is_crisis_detected) VALUES
(1, 'USER', N'Chào SERO, hôm nay mình cảm thấy hơi buồn...', 0),
(1, 'SERO', N'Chào bạn! Mình rất vui được trò chuyện cùng bạn. Bạn có muốn chia sẻ thêm về cảm giác buồn của mình không? Điều gì đã xảy ra?', 0),
(1, 'USER', N'Mình bị sếp mắng ở công ty, cảm giác mình vô dụng quá.', 0),
(1, 'SERO', N'Mình hiểu cảm giác đó rất khó chịu. Nhưng hãy nhớ rằng một lần mắng không định nghĩa giá trị của bạn. Bạn đã cố gắng hết sức chưa? Và quan trọng hơn, bạn đã học được gì từ tình huống này?', 0),
(2, 'USER', N'Mình cảm thấy áp lực công việc quá lớn, không biết phải làm sao...', 0),
(2, 'SERO', N'Áp lực công việc là điều nhiều người gặp phải. Hãy thử chia nhỏ công việc thành các task nhỏ hơn. Bạn có thể kể cho mình nghe về công việc của bạn không?', 0);

-- 9.11. Mood Logs mẫu
INSERT INTO Mood_Logs (user_id, mood_score, note) VALUES
(2, 3, N'Hôm nay bình thường, không có gì đặc biệt'),
(2, 2, N'Buồn vì bị mắng ở công ty'),
(3, 4, N'Vui vì được nghỉ cuối tuần'),
(3, 5, N'Rất vui! Được tăng lương hehe'),
(4, 2, N'Hơi stress vì deadline');

-- 9.12. Notifications mẫu
INSERT INTO Notifications (user_id, title, content) VALUES
(2, N'💝 Lời nhắn hôm nay', N'Bạn đã làm rất tốt rồi, hãy yêu thương bản thân nhé!'),
(2, N'🎵 Thử nghe nhạc thư giãn nhé', N'Góc Relax có thêm bài nhạc mới: "Tiếng mưa rơi nhẹ nhàng"'),
(3, N'📝 Bài viết mới', N'Có bài viết mới: "5 dấu hiệu nhận biết trầm cảm sớm"'),
(3, N'⚠️ Đừng quên ghi nhật ký cảm xúc', N'Bạn chưa ghi tâm trạng hôm nay. Hãy dành 1 phút để check-in với cảm xúc của mình nhé!'),
(4, N'🎁 Nâng cấp SERO Plus', N'Trải nghiệm không giới hạn với SERO Plus. Ưu đãi chỉ 49k/tháng!');