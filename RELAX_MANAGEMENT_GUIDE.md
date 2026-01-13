# Hướng dẫn Quản lý Relax

## Tổng quan
Hệ thống quản lý Relax cho phép Admin thực hiện đầy đủ các thao tác CRUD đối với các nội dung thư giãn (âm nhạc, bài tập thở, thiền), với tất cả video/audio được lưu trên **Cloudinary**.

## 🎯 Tính năng

### 1. Danh sách Relax Assets (ManageRelaxScreen)
**Đường dẫn:** Admin Dashboard → Quản lý Relax

**Chức năng:**
- ✅ Hiển thị danh sách tất cả relax assets với phân trang (10 items/trang)
- ✅ Tìm kiếm theo tiêu đề
- ✅ Lọc theo loại (MUSIC, BREATHING, MEDITATION)
- ✅ Hiển thị trạng thái Premium/Free
- ✅ Pull-to-refresh để tải lại dữ liệu
- ✅ Thống kê tổng số assets

**Các nút hành động:**
- 👁️ **Xem**: Xem chi tiết đầy đủ thông tin
- ✏️ **Sửa**: Chỉnh sửa thông tin
- ❌ **Xóa**: Xóa asset (soft delete)
- ➕ **Thêm**: Thêm asset mới

### 2. Thêm Relax Asset (AddRelaxAssetScreen)
**Đường dẫn:** Quản lý Relax → Nút ➕

**Thông tin bắt buộc:**
- Tiêu đề *
- Media (Video/Audio) * - Upload lên Cloudinary

**Thông tin tùy chọn:**
- Ảnh bìa/Thumbnail (tỷ lệ 16:9) - Upload lên Cloudinary
- Loại (MUSIC/BREATHING/MEDITATION)
- Premium toggle

**Quy trình upload media:**
1. Nhập tiêu đề
2. Chọn loại nội dung
3. Nhấn "Chọn file media" → chọn video/audio từ thiết bị
4. Xác nhận upload → File sẽ được upload lên Cloudinary
5. (Tùy chọn) Nhấn ảnh bìa → chọn thumbnail → Upload lên Cloudinary
6. Toggle Premium nếu cần
7. Nhấn "Tạo Relax Asset"

**File types hỗ trợ:**
- **Video**: MP4, MOV, AVI
- **Audio**: MP3, WAV, OGG
- **Thumbnail**: JPG, JPEG, PNG

## ☁️ Cloudinary Integration

### Upload Media (Video/Audio)
- **Endpoint:** POST /api/Admin/Relax/upload-media
- **Folders:**
  - Video: `serochat/relax/videos`
  - Audio: `serochat/relax/audios`
- **Loại file:** MP4, MOV, AVI (video) / MP3, WAV, OGG (audio)
- **Quy trình:**
  1. Validate file type
  2. Upload lên Cloudinary
  3. Nhận về URL
  4. Trả về mediaUrl cho frontend

### Upload Thumbnail
- **Endpoint:** POST /api/Admin/Relax/upload-thumbnail
- **Folder:** `serochat/relax/thumbnails`
- **Loại file:** JPG, JPEG, PNG
- **Quy trình:**
  1. Validate file type (image only)
  2. Upload lên Cloudinary
  3. Nhận về URL
  4. Trả về thumbnailUrl cho frontend

## 🔧 Backend API

### Danh sách API

#### 1. GET /api/Admin/Relax
Lấy danh sách relax assets với phân trang và tìm kiếm
```
Query params:
- page: số trang (mặc định 1)
- pageSize: số items/trang (mặc định 10)
- search: tìm kiếm theo tiêu đề
- type: lọc theo loại (MUSIC/BREATHING/MEDITATION)
```

#### 2. GET /api/Admin/Relax/{id}
Lấy chi tiết relax asset theo ID

#### 3. POST /api/Admin/Relax
Tạo relax asset mới
```json
{
  "title": "Nhạc thư giãn buổi tối",
  "type": "MUSIC",
  "mediaUrl": "https://res.cloudinary.com/.../video.mp4",
  "thumbnailUrl": "https://res.cloudinary.com/.../thumb.jpg",
  "isPremium": true
}
```

#### 4. PUT /api/Admin/Relax/{id}
Cập nhật thông tin relax asset

#### 5. DELETE /api/Admin/Relax/{id}
Xóa relax asset (soft delete - set IsDeleted = true)

#### 6. POST /api/Admin/Relax/upload-media
Upload video/audio lên Cloudinary
```
Content-Type: multipart/form-data
Body:
- file (video/audio file)
- type (string: "video" or "audio")

Response:
{
  "success": true,
  "message": "Upload media thành công",
  "data": {
    "mediaUrl": "https://res.cloudinary.com/..."
  }
}
```

#### 7. POST /api/Admin/Relax/upload-thumbnail
Upload thumbnail lên Cloudinary
```
Content-Type: multipart/form-data
Body: file (image file)

Response:
{
  "success": true,
  "message": "Upload thumbnail thành công",
  "data": {
    "thumbnailUrl": "https://res.cloudinary.com/..."
  }
}
```

#### 8. GET /api/Admin/Relax/stats
Lấy thống kê (tổng assets, premium/free, theo loại)

### User API (Đã có sẵn)
#### GET /api/Relax/assets
Lấy danh sách relax assets cho user
```
Query params:
- type: lọc theo loại (optional)
```

## 📱 Frontend Services

### relaxService.ts

**Admin Methods:**
```typescript
- adminGetRelaxAssets(page, pageSize, search, type)
- adminGetRelaxAssetById(assetId)
- adminCreateRelaxAsset(data)
- adminUpdateRelaxAsset(assetId, data)
- adminDeleteRelaxAsset(assetId)
- adminUploadMedia(fileUri, type: 'video' | 'audio')
- adminUploadThumbnail(imageUri)
- adminGetStats()
```

**User Methods (Existing):**
```typescript
- getRelaxAssets(type?)
- getRelaxAssetById(assetId)
- getAssetTypeLabel(type)
```

## 🗄️ Database Schema

### RelaxAsset Table
```sql
- AssetId (PK)
- Title (NOT NULL)
- Type (MUSIC/BREATHING/MEDITATION)
- MediaUrl (NOT NULL, Cloudinary URL)
- ThumbnailUrl (Cloudinary URL)
- IsPremium (Default: false)
- IsDeleted (Default: false)
- CreatedAt
```

## 🔐 Phân quyền
**Yêu cầu:**
- Chỉ tài khoản có role = "ADMIN" mới được truy cập admin endpoints
- User thường chỉ có thể xem assets qua /api/Relax/assets

## 📝 Navigation Routes

```typescript
App.tsx routes:
- ManageRelax: ManageRelaxScreen
- AddRelaxAsset: AddRelaxAssetScreen
- EditRelaxAsset: EditRelaxAssetScreen (TODO)
- RelaxDetailAdmin: RelaxDetailAdminScreen (TODO)
```

## ⚠️ Lưu ý quan trọng

1. **Cloudinary Storage:**
   - Tất cả video/audio PHẢI upload lên Cloudinary
   - Không lưu file trực tiếp trên server
   - Cloudinary folders:
     - Videos: `serochat/relax/videos`
     - Audios: `serochat/relax/audios`
     - Thumbnails: `serochat/relax/thumbnails`

2. **File Size:**
   - Video/Audio có thể lớn → cần hiển thị progress
   - User cần xác nhận trước khi upload
   - Backend validate file type

3. **Types:**
   - MUSIC: Âm nhạc thư giãn
   - BREATHING: Bài tập thở
   - MEDITATION: Hướng dẫn thiền

4. **Premium Content:**
   - Assets có isPremium = true chỉ user Premium mới xem được
   - Free user chỉ xem được isPremium = false

5. **Soft Delete:**
   - Khi xóa asset, chỉ set IsDeleted = true
   - Không xóa vật lý khỏi database

6. **Dependencies:**
   - Frontend cần: `expo-document-picker` để chọn video/audio files
   - Frontend cần: `expo-image-picker` để chọn thumbnails

## 🚀 Hướng dẫn Test

### Test Add Relax Asset:
1. Login với tài khoản admin
2. Vào Menu → Dashboard Admin → Quản lý Relax
3. Nhấn nút ➕
4. Nhập tiêu đề: "Nhạc thư giãn"
5. Chọn loại: MUSIC
6. Nhấn "Chọn file media" → chọn file MP3/MP4
7. Xác nhận upload → Đợi upload lên Cloudinary
8. (Tùy chọn) Chọn thumbnail
9. Toggle Premium nếu cần
10. Nhấn "Tạo Relax Asset"
11. Kiểm tra trong danh sách

### Test Upload Process:
1. Chọn file media (video hoặc audio)
2. Alert hiển thị thông tin file và size
3. Xác nhận upload
4. Loading indicator hiển thị trong quá trình upload
5. Sau khi upload xong, mediaUrl sẽ được điền vào form
6. Có thể thấy checkmark ✓ ở nút upload

### Test Filter:
1. Ở danh sách, nhấn icon filter
2. Chọn loại (MUSIC/BREATHING/MEDITATION)
3. Danh sách tự động lọc
4. Badge hiển thị trên icon filter
5. Nhấn "Xóa lọc" để reset

## 🔍 Troubleshooting

**Lỗi: "Failed to upload media"**
- Kiểm tra Cloudinary service đã được config
- Kiểm tra file size không quá lớn (Cloudinary có giới hạn)
- Kiểm tra định dạng file hợp lệ
- Kiểm tra network connection (upload có thể lâu với file lớn)

**Lỗi: "Cannot find module 'expo-document-picker'"**
- Chạy: `npm install expo-document-picker`
- Rebuild ứng dụng

**Media không phát được:**
- Kiểm tra mediaUrl có hợp lệ
- Kiểm tra Cloudinary URL accessible
- Thử mở URL trực tiếp trong browser
- Kiểm tra định dạng file có được hỗ trợ

**Thumbnail không hiển thị:**
- Kiểm tra thumbnailUrl có hợp lệ
- Kiểm tra tỷ lệ ảnh (khuyến nghị 16:9)

## 📦 Required Packages

**Frontend:**
```json
{
  "expo-document-picker": "^11.x",
  "expo-image-picker": "^14.x"
}
```

**Backend:**
```
ICloudinaryService (already exists)
```

## 🎬 Workflow Tổng quan

```
1. User tạo Relax Asset mới
   ↓
2. Nhập thông tin cơ bản (title, type)
   ↓
3. Chọn file media (video/audio)
   ↓
4. Upload lên Cloudinary (serochat/relax/videos or /audios)
   ↓
5. Nhận về mediaUrl
   ↓
6. (Optional) Chọn thumbnail
   ↓
7. Upload thumbnail lên Cloudinary (serochat/relax/thumbnails)
   ↓
8. Nhận về thumbnailUrl
   ↓
9. Submit form → Tạo record trong database với URLs
   ↓
10. User thường có thể xem/phát nội dung từ Cloudinary URLs
```

## 📞 Tính năng còn thiếu (TODO)

- [ ] EditRelaxAssetScreen - Màn hình sửa relax asset
- [ ] RelaxDetailAdminScreen - Màn hình xem chi tiết cho admin
- [ ] Upload progress indicator cho file lớn
- [ ] Batch upload nhiều files cùng lúc
- [ ] Preview media trước khi submit
- [ ] Quản lý categories/playlists

## 💡 Tips

1. **Upload file lớn:**
   - Nên compress video trước khi upload
   - Khuyến nghị video resolution: 720p hoặc 1080p
   - Audio bitrate: 128kbps hoặc 192kbps

2. **Thumbnail:**
   - Tạo thumbnail đẹp để thu hút user
   - Tỷ lệ 16:9 chuẩn cho video player
   - File size nhỏ để load nhanh

3. **Organization:**
   - Đặt tên file rõ ràng
   - Phân loại type đúng
   - Tag Premium cho nội dung cao cấp

4. **Testing:**
   - Test với nhiều định dạng file khác nhau
   - Test với file size lớn
   - Test trên nhiều thiết bị
