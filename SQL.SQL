USE [SeroChat]
GO
/****** Object:  Table [dbo].[Blog_Categories]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Blog_Categories](
	[blog_cat_id] [int] IDENTITY(1,1) NOT NULL,
	[category_name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[blog_cat_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Blog_Read_History]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Blog_Read_History](
	[read_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[blog_id] [int] NOT NULL,
	[read_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[read_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Blogs]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Blogs](
	[blog_id] [int] IDENTITY(1,1) NOT NULL,
	[blog_cat_id] [int] NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[content] [nvarchar](max) NOT NULL,
	[thumbnail_url] [nvarchar](max) NULL,
	[author_name] [nvarchar](100) NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[blog_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Conversations]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Conversations](
	[conv_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[title] [nvarchar](255) NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[conv_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Crisis_Alert_Logs]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Crisis_Alert_Logs](
	[alert_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[msg_id] [int] NULL,
	[alert_time] [datetime] NULL,
	[is_resolved] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[alert_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Daily_Affirmations]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Daily_Affirmations](
	[aff_id] [int] IDENTITY(1,1) NOT NULL,
	[content] [nvarchar](max) NOT NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[aff_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Doctor_Certificates]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Doctor_Certificates](
	[cert_id] [int] IDENTITY(1,1) NOT NULL,
	[doctor_id] [int] NOT NULL,
	[certificate_name] [nvarchar](200) NULL,
	[image_url] [nvarchar](max) NOT NULL,
	[uploaded_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[cert_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Doctors]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Doctors](
	[doctor_id] [int] IDENTITY(1,1) NOT NULL,
	[specialty_id] [int] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[experience_years] [int] NULL,
	[phone] [varchar](20) NULL,
	[zalo_url] [nvarchar](max) NULL,
	[address] [nvarchar](255) NULL,
	[bio_detail] [nvarchar](max) NULL,
	[image_url] [nvarchar](max) NULL,
	[is_active] [bit] NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[doctor_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Messages]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Messages](
	[msg_id] [int] IDENTITY(1,1) NOT NULL,
	[conv_id] [int] NOT NULL,
	[sender_type] [nvarchar](10) NULL,
	[content] [nvarchar](max) NOT NULL,
	[is_crisis_detected] [bit] NULL,
	[is_deleted] [bit] NULL,
	[sent_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[msg_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Mood_Logs]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Mood_Logs](
	[log_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[mood_score] [int] NULL,
	[note] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[log_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notifications]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notifications](
	[notify_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[title] [nvarchar](200) NULL,
	[content] [nvarchar](max) NULL,
	[is_read] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[notify_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Relax_Assets]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Relax_Assets](
	[asset_id] [int] IDENTITY(1,1) NOT NULL,
	[title] [nvarchar](100) NOT NULL,
	[type] [nvarchar](20) NULL,
	[media_url] [nvarchar](max) NOT NULL,
	[thumbnail_url] [nvarchar](max) NULL,
	[is_premium] [bit] NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[asset_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Saved_Blogs]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Saved_Blogs](
	[saved_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[blog_id] [int] NOT NULL,
	[saved_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[saved_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Specialties]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Specialties](
	[specialty_id] [int] IDENTITY(1,1) NOT NULL,
	[specialty_name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[specialty_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Subscription_Plans]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Subscription_Plans](
	[plan_id] [int] IDENTITY(1,1) NOT NULL,
	[plan_name] [nvarchar](100) NOT NULL,
	[price] [decimal](18, 2) NOT NULL,
	[duration_days] [int] NOT NULL,
	[daily_message_limit] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[plan_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Transactions]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Transactions](
	[order_code] [bigint] NOT NULL,
	[user_id] [int] NOT NULL,
	[plan_id] [int] NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
	[payment_method] [nvarchar](50) NULL,
	[payment_status] [nvarchar](50) NULL,
	[transaction_date] [datetime] NULL,
	[start_date] [datetime] NULL,
	[end_date] [datetime] NULL,
	[payos_transaction_id] [nvarchar](100) NULL,
	[description] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[order_code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 12/01/2026 3:16:59 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[user_id] [int] IDENTITY(1,1) NOT NULL,
	[email] [nvarchar](150) NOT NULL,
	[password_hash] [nvarchar](max) NULL,
	[google_id] [nvarchar](255) NULL,
	[auth_provider] [nvarchar](20) NULL,
	[full_name] [nvarchar](100) NULL,
	[phone_number] [varchar](15) NULL,
	[gender] [nvarchar](20) NULL,
	[date_of_birth] [date] NULL,
	[avatar_url] [nvarchar](max) NULL,
	[role] [nvarchar](20) NULL,
	[subscription_status] [nvarchar](20) NULL,
	[premium_expiry] [datetime] NULL,
	[messages_sent_today] [int] NOT NULL DEFAULT 0,
	[last_message_reset_date] [datetime2] NULL,
	[theme] [nvarchar](20) NULL,
	[language] [nvarchar](10) NULL,
	[status] [nvarchar](20) NULL,
	[is_verify] [bit] NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Blog_Categories] ON 

INSERT [dbo].[Blog_Categories] ([blog_cat_id], [category_name], [description]) VALUES (1, N'Trầm cảm', N'Kiến thức về trầm cảm, dấu hiệu và cách đối phó')
INSERT [dbo].[Blog_Categories] ([blog_cat_id], [category_name], [description]) VALUES (2, N'Lo âu & Stress', N'Quản lý căng thẳng và lo lắng trong cuộc sống')
INSERT [dbo].[Blog_Categories] ([blog_cat_id], [category_name], [description]) VALUES (3, N'Kỹ năng sống', N'Phát triển bản thân và kỹ năng mềm')
INSERT [dbo].[Blog_Categories] ([blog_cat_id], [category_name], [description]) VALUES (4, N'Tình yêu & Gia đình', N'Mối quan hệ và tâm lý gia đình')
INSERT [dbo].[Blog_Categories] ([blog_cat_id], [category_name], [description]) VALUES (5, N'Sức khỏe tinh thần', N'Chăm sóc và duy trì sức khỏe tâm lý')
SET IDENTITY_INSERT [dbo].[Blog_Categories] OFF
GO
SET IDENTITY_INSERT [dbo].[Blogs] ON 

INSERT [dbo].[Blogs] ([blog_id], [blog_cat_id], [title], [content], [thumbnail_url], [author_name], [is_deleted], [created_at]) VALUES (1, 1, N'5 dấu hiệu nhận biết trầm cảm sớm', N'<h2>Trầm cảm là gì?</h2><p>Trầm cảm là một rối loạn tâm trạng phổ biến, gây ra cảm giác buồn bã kéo dài và mất hứng thú với các hoạt động...</p><h3>Các dấu hiệu cảnh báo:</h3><ul><li>Buồn bã kéo dài hơn 2 tuần</li><li>Mất ngủ hoặc ngủ quá nhiều</li><li>Cảm giác tội lỗi, vô giá trị</li><li>Khó tập trung</li><li>Có ý nghĩ tự hủy hoại</li></ul>', N'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', N'BS. Nguyễn Văn Minh', 0, CAST(N'2026-01-08T15:59:30.633' AS DateTime))
INSERT [dbo].[Blogs] ([blog_id], [blog_cat_id], [title], [content], [thumbnail_url], [author_name], [is_deleted], [created_at]) VALUES (2, 2, N'7 cách giảm stress hiệu quả mỗi ngày', N'<h2>Stress trong cuộc sống hiện đại</h2><p>Cuộc sống ngày càng bận rộn khiến stress trở thành vấn đề phổ biến...</p><h3>Các phương pháp:</h3><ol><li>Thiền và hít thở sâu</li><li>Tập thể dục đều đặn</li><li>Ngủ đủ giấc</li><li>Kết nối với người thân</li><li>Viết nhật ký</li><li>Nghe nhạc thư giãn</li><li>Giảm caffeine</li></ol>', N'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800', N'ThS. Trần Thị Hương', 0, CAST(N'2026-01-08T15:59:30.633' AS DateTime))
INSERT [dbo].[Blogs] ([blog_id], [blog_cat_id], [title], [content], [thumbnail_url], [author_name], [is_deleted], [created_at]) VALUES (3, 3, N'Làm thế nào để nói "Không" mà không cảm thấy tội lỗi', N'<h2>Kỹ năng từ chối</h2><p>Nhiều người gặp khó khăn khi từ chối yêu cầu của người khác vì sợ làm mất lòng...</p><p>Học cách đặt ranh giới là rất quan trọng cho sức khỏe tinh thần.</p>', N'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800', N'SERO Team', 0, CAST(N'2026-01-08T15:59:30.633' AS DateTime))
INSERT [dbo].[Blogs] ([blog_id], [blog_cat_id], [title], [content], [thumbnail_url], [author_name], [is_deleted], [created_at]) VALUES (4, 4, N'Làm gì khi cãi nhau với người yêu?', N'<h2>Xung đột trong mối quan hệ</h2><p>Cãi vã là điều bình thường, nhưng cách giải quyết mới là điều quan trọng...</p><ul><li>Lắng nghe không tranh luận</li><li>Sử dụng "tôi cảm thấy" thay vì "bạn luôn luôn"</li><li>Chọn thời điểm phù hợp để nói chuyện</li><li>Tránh đào lại chuyện cũ</li></ul>', N'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800', N'TS. Lê Hoàng Nam', 0, CAST(N'2026-01-08T15:59:30.633' AS DateTime))
INSERT [dbo].[Blogs] ([blog_id], [blog_cat_id], [title], [content], [thumbnail_url], [author_name], [is_deleted], [created_at]) VALUES (5, 5, N'Self-care: Chăm sóc bản thân không phải là ích kỷ', N'<h2>Tại sao self-care quan trọng?</h2><p>Trong xã hội hiện đại, nhiều người quên chăm sóc bản thân vì bận rộn với công việc và người khác...</p><p>Nhưng bạn không thể rót từ một chiếc cốc rỗng. Hãy chăm sóc bản thân trước khi chăm sóc người khác.</p>', N'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', N'SERO Team', 0, CAST(N'2026-01-08T15:59:30.633' AS DateTime))
SET IDENTITY_INSERT [dbo].[Blogs] OFF
GO
SET IDENTITY_INSERT [dbo].[Conversations] ON 

INSERT [dbo].[Conversations] ([conv_id], [user_id], [title], [is_deleted], [created_at]) VALUES (1, 2, N'Cuộc trò chuyện với SERO - 08/01/2026', 0, CAST(N'2026-01-08T15:59:30.650' AS DateTime))
INSERT [dbo].[Conversations] ([conv_id], [user_id], [title], [is_deleted], [created_at]) VALUES (2, 3, N'Tâm sự về công việc', 0, CAST(N'2026-01-08T15:59:30.650' AS DateTime))
INSERT [dbo].[Conversations] ([conv_id], [user_id], [title], [is_deleted], [created_at]) VALUES (3, 4, N'Chia sẻ về gia đình', 0, CAST(N'2026-01-08T15:59:30.650' AS DateTime))
SET IDENTITY_INSERT [dbo].[Conversations] OFF
GO
SET IDENTITY_INSERT [dbo].[Daily_Affirmations] ON 

INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (1, N'Hôm nay sẽ là một ngày tuyệt vời. Mình xứng đáng được yêu thương và hạnh phúc.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (2, N'Mình không cần phải hoàn hảo. Mình chỉ cần cố gắng hết sức mình.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (3, N'Cảm xúc của mình là hợp lệ. Mình được phép cảm thấy những gì mình đang cảm thấy.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (4, N'Mọi chuyện rồi sẽ ổn thôi. Mình đã vượt qua nhiều khó khăn rồi, lần này cũng vậy.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (5, N'Mình tự hào về những gì mình đã làm được. Dù nhỏ hay lớn, đó đều là tiến bộ.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (6, N'Hãy yêu thương bản thân như cách mình yêu thương những người mình quý.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (7, N'Không sao nếu hôm nay mình không làm được nhiều. Nghỉ ngơi cũng là năng suất.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (8, N'Mình đang trên hành trình của riêng mình. Không cần so sánh với người khác.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (9, N'Chấp nhận bản thân là bước đầu tiên để thay đổi. Mình đang làm tốt lắm rồi.', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Daily_Affirmations] ([aff_id], [content], [is_deleted], [created_at]) VALUES (10, N'Mỗi ngày là một cơ hội mới để bắt đầu lại. Hãy thử một lần nữa nhé!', 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
SET IDENTITY_INSERT [dbo].[Daily_Affirmations] OFF
GO
SET IDENTITY_INSERT [dbo].[Doctor_Certificates] ON 

INSERT [dbo].[Doctor_Certificates] ([cert_id], [doctor_id], [certificate_name], [image_url], [uploaded_at]) VALUES (1, 1, N'Chứng chỉ hành nghề Tâm lý lâm sàng', N'https://via.placeholder.com/600x400/4CAF50/FFFFFF?text=Certificate+1', CAST(N'2026-01-08T15:59:30.623' AS DateTime))
INSERT [dbo].[Doctor_Certificates] ([cert_id], [doctor_id], [certificate_name], [image_url], [uploaded_at]) VALUES (2, 1, N'Bằng Thạc sĩ Tâm lý học', N'https://via.placeholder.com/600x400/2196F3/FFFFFF?text=Master+Degree', CAST(N'2026-01-08T15:59:30.623' AS DateTime))
INSERT [dbo].[Doctor_Certificates] ([cert_id], [doctor_id], [certificate_name], [image_url], [uploaded_at]) VALUES (3, 2, N'Chứng chỉ Tâm lý trẻ em', N'https://via.placeholder.com/600x400/FF9800/FFFFFF?text=Child+Psychology', CAST(N'2026-01-08T15:59:30.623' AS DateTime))
INSERT [dbo].[Doctor_Certificates] ([cert_id], [doctor_id], [certificate_name], [image_url], [uploaded_at]) VALUES (4, 3, N'Bằng Tiến sĩ Tâm lý học', N'https://via.placeholder.com/600x400/9C27B0/FFFFFF?text=PhD+Psychology', CAST(N'2026-01-08T15:59:30.623' AS DateTime))
SET IDENTITY_INSERT [dbo].[Doctor_Certificates] OFF
GO
SET IDENTITY_INSERT [dbo].[Doctors] ON 

INSERT [dbo].[Doctors] ([doctor_id], [specialty_id], [name], [experience_years], [phone], [zalo_url], [address], [bio_detail], [image_url], [is_active], [is_deleted], [created_at]) VALUES (1, 1, N'Ths. BS Nguyễn Văn Minh', 8, N'0912345678', N'https://zalo.me/0912345678', N'Bệnh viện Tâm thần Trung ương, Hà Nội', N'Chuyên gia về trầm cảm và rối loạn lo âu. Từng công tác tại Viện Tâm lý học Việt Nam. Có hơn 8 năm kinh nghiệm điều trị và tư vấn tâm lý.', N'https://i.pravatar.cc/300?img=12', 1, 0, CAST(N'2026-01-08T15:59:30.617' AS DateTime))
INSERT [dbo].[Doctors] ([doctor_id], [specialty_id], [name], [experience_years], [phone], [zalo_url], [address], [bio_detail], [image_url], [is_active], [is_deleted], [created_at]) VALUES (2, 2, N'ThS. Trần Thị Hương', 5, N'0923456789', N'https://zalo.me/0923456789', N'Trung tâm Tâm lý Hà Nội', N'Chuyên gia tâm lý trẻ em với 5 năm kinh nghiệm. Tốt nghiệp Thạc sĩ Tâm lý học tại ĐH Quốc gia Hà Nội.', N'https://i.pravatar.cc/300?img=47', 1, 0, CAST(N'2026-01-08T15:59:30.617' AS DateTime))
INSERT [dbo].[Doctors] ([doctor_id], [specialty_id], [name], [experience_years], [phone], [zalo_url], [address], [bio_detail], [image_url], [is_active], [is_deleted], [created_at]) VALUES (3, 3, N'TS. Lê Hoàng Nam', 12, N'0934567890', N'https://zalo.me/0934567890', N'Phòng khám Tâm lý An Nhiên, TP.HCM', N'Tiến sĩ Tâm lý học, chuyên về tư vấn hôn nhân và gia đình. Có hơn 12 năm kinh nghiệm giảng dạy và thực hành lâm sàng.', N'https://i.pravatar.cc/300?img=68', 1, 0, CAST(N'2026-01-08T15:59:30.617' AS DateTime))
INSERT [dbo].[Doctors] ([doctor_id], [specialty_id], [name], [experience_years], [phone], [zalo_url], [address], [bio_detail], [image_url], [is_active], [is_deleted], [created_at]) VALUES (4, 4, N'Ths. Phạm Thị Lan', 6, N'0945678901', N'https://zalo.me/0945678901', N'Công ty Tư vấn Tâm lý MindCare, Đà Nẵng', N'Chuyên gia về stress công việc và hội chứng burnout. Tư vấn cho nhiều doanh nghiệp lớn về sức khỏe tinh thần nhân viên.', N'https://i.pravatar.cc/300?img=20', 1, 0, CAST(N'2026-01-08T15:59:30.617' AS DateTime))
SET IDENTITY_INSERT [dbo].[Doctors] OFF
GO
SET IDENTITY_INSERT [dbo].[Messages] ON 

INSERT [dbo].[Messages] ([msg_id], [conv_id], [sender_type], [content], [is_crisis_detected], [is_deleted], [sent_at]) VALUES (1, 1, N'USER', N'Chào SERO, hôm nay mình cảm thấy hơi buồn...', 0, 0, CAST(N'2026-01-08T15:59:30.657' AS DateTime))
INSERT [dbo].[Messages] ([msg_id], [conv_id], [sender_type], [content], [is_crisis_detected], [is_deleted], [sent_at]) VALUES (2, 1, N'SERO', N'Chào bạn! Mình rất vui được trò chuyện cùng bạn. Bạn có muốn chia sẻ thêm về cảm giác buồn của mình không? Điều gì đã xảy ra?', 0, 0, CAST(N'2026-01-08T15:59:30.657' AS DateTime))
INSERT [dbo].[Messages] ([msg_id], [conv_id], [sender_type], [content], [is_crisis_detected], [is_deleted], [sent_at]) VALUES (3, 1, N'USER', N'Mình bị sếp mắng ở công ty, cảm giác mình vô dụng quá.', 0, 0, CAST(N'2026-01-08T15:59:30.657' AS DateTime))
INSERT [dbo].[Messages] ([msg_id], [conv_id], [sender_type], [content], [is_crisis_detected], [is_deleted], [sent_at]) VALUES (4, 1, N'SERO', N'Mình hiểu cảm giác đó rất khó chịu. Nhưng hãy nhớ rằng một lần mắng không định nghĩa giá trị của bạn. Bạn đã cố gắng hết sức chưa? Và quan trọng hơn, bạn đã học được gì từ tình huống này?', 0, 0, CAST(N'2026-01-08T15:59:30.657' AS DateTime))
INSERT [dbo].[Messages] ([msg_id], [conv_id], [sender_type], [content], [is_crisis_detected], [is_deleted], [sent_at]) VALUES (5, 2, N'USER', N'Mình cảm thấy áp lực công việc quá lớn, không biết phải làm sao...', 0, 0, CAST(N'2026-01-08T15:59:30.657' AS DateTime))
INSERT [dbo].[Messages] ([msg_id], [conv_id], [sender_type], [content], [is_crisis_detected], [is_deleted], [sent_at]) VALUES (6, 2, N'SERO', N'Áp lực công việc là điều nhiều người gặp phải. Hãy thử chia nhỏ công việc thành các task nhỏ hơn. Bạn có thể kể cho mình nghe về công việc của bạn không?', 0, 0, CAST(N'2026-01-08T15:59:30.657' AS DateTime))
SET IDENTITY_INSERT [dbo].[Messages] OFF
GO
SET IDENTITY_INSERT [dbo].[Mood_Logs] ON 

INSERT [dbo].[Mood_Logs] ([log_id], [user_id], [mood_score], [note], [created_at]) VALUES (1, 2, 3, N'Hôm nay bình thường, không có gì đặc biệt', CAST(N'2026-01-08T15:59:30.663' AS DateTime))
INSERT [dbo].[Mood_Logs] ([log_id], [user_id], [mood_score], [note], [created_at]) VALUES (2, 2, 2, N'Buồn vì bị mắng ở công ty', CAST(N'2026-01-08T15:59:30.663' AS DateTime))
INSERT [dbo].[Mood_Logs] ([log_id], [user_id], [mood_score], [note], [created_at]) VALUES (3, 3, 4, N'Vui vì được nghỉ cuối tuần', CAST(N'2026-01-08T15:59:30.663' AS DateTime))
INSERT [dbo].[Mood_Logs] ([log_id], [user_id], [mood_score], [note], [created_at]) VALUES (4, 3, 5, N'Rất vui! Được tăng lương hehe', CAST(N'2026-01-08T15:59:30.663' AS DateTime))
INSERT [dbo].[Mood_Logs] ([log_id], [user_id], [mood_score], [note], [created_at]) VALUES (5, 4, 2, N'Hơi stress vì deadline', CAST(N'2026-01-08T15:59:30.663' AS DateTime))
SET IDENTITY_INSERT [dbo].[Mood_Logs] OFF
GO
SET IDENTITY_INSERT [dbo].[Notifications] ON 

INSERT [dbo].[Notifications] ([notify_id], [user_id], [title], [content], [is_read], [created_at]) VALUES (1, 2, N'💝 Lời nhắn hôm nay', N'Bạn đã làm rất tốt rồi, hãy yêu thương bản thân nhé!', 0, CAST(N'2026-01-08T15:59:30.670' AS DateTime))
INSERT [dbo].[Notifications] ([notify_id], [user_id], [title], [content], [is_read], [created_at]) VALUES (2, 2, N'🎵 Thử nghe nhạc thư giãn nhé', N'Góc Relax có thêm bài nhạc mới: "Tiếng mưa rơi nhẹ nhàng"', 0, CAST(N'2026-01-08T15:59:30.670' AS DateTime))
INSERT [dbo].[Notifications] ([notify_id], [user_id], [title], [content], [is_read], [created_at]) VALUES (3, 3, N'📝 Bài viết mới', N'Có bài viết mới: "5 dấu hiệu nhận biết trầm cảm sớm"', 0, CAST(N'2026-01-08T15:59:30.670' AS DateTime))
INSERT [dbo].[Notifications] ([notify_id], [user_id], [title], [content], [is_read], [created_at]) VALUES (4, 3, N'⚠️ Đừng quên ghi nhật ký cảm xúc', N'Bạn chưa ghi tâm trạng hôm nay. Hãy dành 1 phút để check-in với cảm xúc của mình nhé!', 0, CAST(N'2026-01-08T15:59:30.670' AS DateTime))
INSERT [dbo].[Notifications] ([notify_id], [user_id], [title], [content], [is_read], [created_at]) VALUES (5, 4, N'🎁 Nâng cấp SERO Plus', N'Trải nghiệm không giới hạn với SERO Plus. Ưu đãi chỉ 49k/tháng!', 0, CAST(N'2026-01-08T15:59:30.670' AS DateTime))
SET IDENTITY_INSERT [dbo].[Notifications] OFF
GO
SET IDENTITY_INSERT [dbo].[Relax_Assets] ON 

INSERT [dbo].[Relax_Assets] ([asset_id], [title], [type], [media_url], [thumbnail_url], [is_premium], [is_deleted], [created_at]) VALUES (1, N'Tiếng mưa rơi nhẹ nhàng', N'MUSIC', N'https://example.com/audio/rain.mp3', N'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=400', 0, 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Relax_Assets] ([asset_id], [title], [type], [media_url], [thumbnail_url], [is_premium], [is_deleted], [created_at]) VALUES (2, N'Sóng biển êm dịu', N'MUSIC', N'https://example.com/audio/ocean.mp3', N'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400', 0, 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Relax_Assets] ([asset_id], [title], [type], [media_url], [thumbnail_url], [is_premium], [is_deleted], [created_at]) VALUES (3, N'Lo-fi chill beats', N'MUSIC', N'https://example.com/audio/lofi.mp3', N'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', 1, 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Relax_Assets] ([asset_id], [title], [type], [media_url], [thumbnail_url], [is_premium], [is_deleted], [created_at]) VALUES (4, N'Âm thanh rừng nhiệt đới', N'MUSIC', N'https://example.com/audio/forest.mp3', N'https://images.unsplash.com/photo-1511497584788-876760111969?w=400', 1, 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Relax_Assets] ([asset_id], [title], [type], [media_url], [thumbnail_url], [is_premium], [is_deleted], [created_at]) VALUES (5, N'Bài tập thở 4-7-8', N'BREATHING', N'https://example.com/video/breathing-4-7-8.mp4', N'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', 0, 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
INSERT [dbo].[Relax_Assets] ([asset_id], [title], [type], [media_url], [thumbnail_url], [is_premium], [is_deleted], [created_at]) VALUES (6, N'Thiền mindfulness 10 phút', N'MEDITATION', N'https://example.com/audio/meditation-10min.mp3', N'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400', 1, 0, CAST(N'2026-01-08T15:59:30.640' AS DateTime))
SET IDENTITY_INSERT [dbo].[Relax_Assets] OFF
GO
SET IDENTITY_INSERT [dbo].[Specialties] ON 

INSERT [dbo].[Specialties] ([specialty_id], [specialty_name], [description]) VALUES (1, N'Tâm lý lâm sàng', N'Chuyên về rối loạn tâm lý, trầm cảm, lo âu')
INSERT [dbo].[Specialties] ([specialty_id], [specialty_name], [description]) VALUES (2, N'Tâm lý trẻ em', N'Tâm lý học phát triển và hành vi trẻ em')
INSERT [dbo].[Specialties] ([specialty_id], [specialty_name], [description]) VALUES (3, N'Tâm lý gia đình', N'Tư vấn hôn nhân, gia đình và các mối quan hệ')
INSERT [dbo].[Specialties] ([specialty_id], [specialty_name], [description]) VALUES (4, N'Tâm lý nghề nghiệp', N'Stress công việc, burnout, định hướng nghề nghiệp')
SET IDENTITY_INSERT [dbo].[Specialties] OFF
GO
SET IDENTITY_INSERT [dbo].[Subscription_Plans] ON 

INSERT [dbo].[Subscription_Plans] ([plan_id], [plan_name], [price], [duration_days], [daily_message_limit]) VALUES (1, N'SERO Free', CAST(1.00 AS Decimal(18, 2)), 365, 20)
INSERT [dbo].[Subscription_Plans] ([plan_id], [plan_name], [price], [duration_days], [daily_message_limit]) VALUES (2, N'SERO Plus - Tháng', CAST(49000.00 AS Decimal(18, 2)), 30, 100)
INSERT [dbo].[Subscription_Plans] ([plan_id], [plan_name], [price], [duration_days], [daily_message_limit]) VALUES (3, N'SERO Plus - Năm', CAST(499000.00 AS Decimal(18, 2)), 365, 999)
SET IDENTITY_INSERT [dbo].[Subscription_Plans] OFF
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([user_id], [email], [password_hash], [google_id], [auth_provider], [full_name], [phone_number], [gender], [date_of_birth], [avatar_url], [role], [subscription_status], [premium_expiry], [theme], [language], [status], [is_verify], [is_deleted], [created_at]) VALUES (1, N'admin@serochat.com', N'$2a$11$kgK30DNnqEv9FSQChzwpi.V7K30cMEUXvLlRlHm947bigYPhNPwj.', NULL, N'LOCAL', N'SERO Admin', N'0901234567', N'Khác', CAST(N'1990-01-01' AS Date), N'https://i.pravatar.cc/150?img=1', N'ADMIN', N'PREMIUM', NULL, N'LIGHT', N'vi', N'ACTIVE', 1, 0, CAST(N'2026-01-08T15:59:30.600' AS DateTime))
INSERT [dbo].[Users] ([user_id], [email], [password_hash], [google_id], [auth_provider], [full_name], [phone_number], [gender], [date_of_birth], [avatar_url], [role], [subscription_status], [premium_expiry], [theme], [language], [status], [is_verify], [is_deleted], [created_at]) VALUES (2, N'user1@gmail.com', NULL, N'google_12345678', N'GOOGLE', N'Nguyễn Văn An', N'0987654321', N'Nam', CAST(N'1995-05-15' AS Date), N'https://i.pravatar.cc/150?img=11', N'USER', N'FREE', NULL, N'DARK', N'vi', N'ACTIVE', 1, 0, CAST(N'2026-01-08T15:59:30.600' AS DateTime))
INSERT [dbo].[Users] ([user_id], [email], [password_hash], [google_id], [auth_provider], [full_name], [phone_number], [gender], [date_of_birth], [avatar_url], [role], [subscription_status], [premium_expiry], [theme], [language], [status], [is_verify], [is_deleted], [created_at]) VALUES (3, N'user2@gmail.com', NULL, N'google_87654321', N'GOOGLE', N'Trần Thị Bình', N'0976543210', N'Nữ', CAST(N'1998-08-20' AS Date), N'https://i.pravatar.cc/150?img=25', N'USER', N'PREMIUM', NULL, N'LIGHT', N'vi', N'ACTIVE', 1, 0, CAST(N'2026-01-08T15:59:30.600' AS DateTime))
INSERT [dbo].[Users] ([user_id], [email], [password_hash], [google_id], [auth_provider], [full_name], [phone_number], [gender], [date_of_birth], [avatar_url], [role], [subscription_status], [premium_expiry], [theme], [language], [status], [is_verify], [is_deleted], [created_at]) VALUES (4, N'user3@gmail.com', N'$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.fLh6p.', NULL, N'LOCAL', N'Lê Minh Cường', NULL, N'Nam', CAST(N'1992-03-10' AS Date), N'https://i.pravatar.cc/150?img=33', N'USER', N'FREE', NULL, N'DARK', N'vi', N'ACTIVE', 1, 0, CAST(N'2026-01-08T15:59:30.600' AS DateTime))
INSERT [dbo].[Users] ([user_id], [email], [password_hash], [google_id], [auth_provider], [full_name], [phone_number], [gender], [date_of_birth], [avatar_url], [role], [subscription_status], [premium_expiry], [theme], [language], [status], [is_verify], [is_deleted], [created_at]) VALUES (5, N'dungbd06@gmail.com', N'$2a$11$BFut7ECAr0SJaiF1G8wQtuqXrkusRFD2WK94zgS5vf/h5CcqYcxWa', NULL, N'LOCAL', N'Duong Tien Dung', N'0961326910', NULL, NULL, NULL, N'USER', N'FREE', NULL, N'LIGHT', N'vi', N'ACTIVE', 1, 0, CAST(N'2026-01-09T15:38:12.240' AS DateTime))
INSERT [dbo].[Users] ([user_id], [email], [password_hash], [google_id], [auth_provider], [full_name], [phone_number], [gender], [date_of_birth], [avatar_url], [role], [subscription_status], [premium_expiry], [theme], [language], [status], [is_verify], [is_deleted], [created_at]) VALUES (6, N'dungbd07@gmail.com', N'$2a$11$kgK30DNnqEv9FSQChzwpi.V7K30cMEUXvLlRlHm947bigYPhNPwj.', NULL, N'LOCAL', N'Dung', N'0961646464', NULL, NULL, NULL, N'USER', N'FREE', NULL, N'LIGHT', N'vi', N'ACTIVE', 1, 0, CAST(N'2026-01-09T15:39:02.747' AS DateTime))
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Blog_Cat__5189E255DB0F2583]    Script Date: 12/01/2026 3:16:59 CH ******/
ALTER TABLE [dbo].[Blog_Categories] ADD UNIQUE NONCLUSTERED 
(
	[category_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_User_Blog]    Script Date: 12/01/2026 3:16:59 CH ******/
ALTER TABLE [dbo].[Saved_Blogs] ADD  CONSTRAINT [UQ_User_Blog] UNIQUE NONCLUSTERED 
(
	[user_id] ASC,
	[blog_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Specialt__9F30F79C39599F1F]    Script Date: 12/01/2026 3:16:59 CH ******/
ALTER TABLE [dbo].[Specialties] ADD UNIQUE NONCLUSTERED 
(
	[specialty_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__AB6E6164071E7860]    Script Date: 12/01/2026 3:16:59 CH ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Blog_Read_History] ADD  DEFAULT (getdate()) FOR [read_at]
GO
ALTER TABLE [dbo].[Blogs] ADD  DEFAULT (N'SERO Team') FOR [author_name]
GO
ALTER TABLE [dbo].[Blogs] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[Blogs] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Conversations] ADD  DEFAULT (N'Cuộc trò chuyện mới') FOR [title]
GO
ALTER TABLE [dbo].[Conversations] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[Conversations] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Crisis_Alert_Logs] ADD  DEFAULT (getdate()) FOR [alert_time]
GO
ALTER TABLE [dbo].[Crisis_Alert_Logs] ADD  DEFAULT ((0)) FOR [is_resolved]
GO
ALTER TABLE [dbo].[Daily_Affirmations] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[Daily_Affirmations] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Doctor_Certificates] ADD  DEFAULT (getdate()) FOR [uploaded_at]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ((0)) FOR [experience_years]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Messages] ADD  DEFAULT ((0)) FOR [is_crisis_detected]
GO
ALTER TABLE [dbo].[Messages] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[Messages] ADD  DEFAULT (getdate()) FOR [sent_at]
GO
ALTER TABLE [dbo].[Mood_Logs] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Notifications] ADD  DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[Notifications] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Relax_Assets] ADD  DEFAULT ((0)) FOR [is_premium]
GO
ALTER TABLE [dbo].[Relax_Assets] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[Relax_Assets] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Saved_Blogs] ADD  DEFAULT (getdate()) FOR [saved_at]
GO
ALTER TABLE [dbo].[Subscription_Plans] ADD  DEFAULT ((20)) FOR [daily_message_limit]
GO
ALTER TABLE [dbo].[Transactions] ADD  DEFAULT ('PENDING') FOR [status]
GO
ALTER TABLE [dbo].[Transactions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('LOCAL') FOR [auth_provider]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('USER') FOR [role]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('FREE') FOR [subscription_status]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('LIGHT') FOR [theme]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('vi') FOR [language]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('ACTIVE') FOR [status]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [is_verify]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Blog_Read_History]  WITH CHECK ADD  CONSTRAINT [FK_ReadHistory_Blog] FOREIGN KEY([blog_id])
REFERENCES [dbo].[Blogs] ([blog_id])
GO
ALTER TABLE [dbo].[Blog_Read_History] CHECK CONSTRAINT [FK_ReadHistory_Blog]
GO
ALTER TABLE [dbo].[Blog_Read_History]  WITH CHECK ADD  CONSTRAINT [FK_ReadHistory_User] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Blog_Read_History] CHECK CONSTRAINT [FK_ReadHistory_User]
GO
ALTER TABLE [dbo].[Blogs]  WITH CHECK ADD  CONSTRAINT [FK_Blog_Category] FOREIGN KEY([blog_cat_id])
REFERENCES [dbo].[Blog_Categories] ([blog_cat_id])
GO
ALTER TABLE [dbo].[Blogs] CHECK CONSTRAINT [FK_Blog_Category]
GO
ALTER TABLE [dbo].[Conversations]  WITH CHECK ADD  CONSTRAINT [FK_Conv_User] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Conversations] CHECK CONSTRAINT [FK_Conv_User]
GO
ALTER TABLE [dbo].[Crisis_Alert_Logs]  WITH CHECK ADD  CONSTRAINT [FK_Alert_Msg] FOREIGN KEY([msg_id])
REFERENCES [dbo].[Messages] ([msg_id])
GO
ALTER TABLE [dbo].[Crisis_Alert_Logs] CHECK CONSTRAINT [FK_Alert_Msg]
GO
ALTER TABLE [dbo].[Crisis_Alert_Logs]  WITH CHECK ADD  CONSTRAINT [FK_Alert_User] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Crisis_Alert_Logs] CHECK CONSTRAINT [FK_Alert_User]
GO
ALTER TABLE [dbo].[Doctor_Certificates]  WITH CHECK ADD  CONSTRAINT [FK_Cert_Doctor] FOREIGN KEY([doctor_id])
REFERENCES [dbo].[Doctors] ([doctor_id])
GO
ALTER TABLE [dbo].[Doctor_Certificates] CHECK CONSTRAINT [FK_Cert_Doctor]
GO
ALTER TABLE [dbo].[Doctors]  WITH CHECK ADD  CONSTRAINT [FK_Doctor_Specialty] FOREIGN KEY([specialty_id])
REFERENCES [dbo].[Specialties] ([specialty_id])
GO
ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [FK_Doctor_Specialty]
GO
ALTER TABLE [dbo].[Messages]  WITH CHECK ADD  CONSTRAINT [FK_Msg_Conv] FOREIGN KEY([conv_id])
REFERENCES [dbo].[Conversations] ([conv_id])
GO
ALTER TABLE [dbo].[Messages] CHECK CONSTRAINT [FK_Msg_Conv]
GO
ALTER TABLE [dbo].[Mood_Logs]  WITH CHECK ADD  CONSTRAINT [FK_Mood_User] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Mood_Logs] CHECK CONSTRAINT [FK_Mood_User]
GO
ALTER TABLE [dbo].[Notifications]  WITH CHECK ADD  CONSTRAINT [FK_Notify_User] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Notifications] CHECK CONSTRAINT [FK_Notify_User]
GO
ALTER TABLE [dbo].[Saved_Blogs]  WITH CHECK ADD  CONSTRAINT [FK_SavedBlog_Blog] FOREIGN KEY([blog_id])
REFERENCES [dbo].[Blogs] ([blog_id])
GO
ALTER TABLE [dbo].[Saved_Blogs] CHECK CONSTRAINT [FK_SavedBlog_Blog]
GO
ALTER TABLE [dbo].[Saved_Blogs]  WITH CHECK ADD  CONSTRAINT [FK_SavedBlog_User] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Saved_Blogs] CHECK CONSTRAINT [FK_SavedBlog_User]
GO
ALTER TABLE [dbo].[Transactions]  WITH CHECK ADD  CONSTRAINT [FK_Trans_Plan] FOREIGN KEY([plan_id])
REFERENCES [dbo].[Subscription_Plans] ([plan_id])
GO
ALTER TABLE [dbo].[Transactions] CHECK CONSTRAINT [FK_Trans_Plan]
GO
ALTER TABLE [dbo].[Transactions]  WITH CHECK ADD  CONSTRAINT [FK_Trans_User] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Transactions] CHECK CONSTRAINT [FK_Trans_User]
GO
ALTER TABLE [dbo].[Messages]  WITH CHECK ADD CHECK  (([sender_type]='SERO' OR [sender_type]='USER'))
GO
ALTER TABLE [dbo].[Mood_Logs]  WITH CHECK ADD CHECK  (([mood_score]>=(1) AND [mood_score]<=(5)))
GO
ALTER TABLE [dbo].[Relax_Assets]  WITH CHECK ADD CHECK  (([type]='MEDITATION' OR [type]='BREATHING' OR [type]='MUSIC'))
GO
ALTER TABLE [dbo].[Transactions]  WITH CHECK ADD CHECK  (([status]='CANCELLED' OR [status]='PAID' OR [status]='PENDING'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([auth_provider]='GOOGLE' OR [auth_provider]='LOCAL'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([gender]=N'Khác' OR [gender]=N'Nữ' OR [gender]=N'Nam'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([language]='en' OR [language]='vi'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([role]='ADMIN' OR [role]='USER'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([status]='INACTIVE' OR [status]='ACTIVE'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([subscription_status]='PREMIUM' OR [subscription_status]='FREE'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([theme]='DARK' OR [theme]='LIGHT'))
GO
