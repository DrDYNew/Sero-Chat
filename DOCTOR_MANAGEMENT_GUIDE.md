# Hướng dẫn Quản lý Bác sĩ

## Tổng quan
Hệ thống quản lý bác sĩ cho phép Admin thực hiện đầy đủ các thao tác CRUD (Create, Read, Update, Delete) đối với thông tin bác sĩ, bao gồm:
- Thêm bác sĩ mới
- Xem chi tiết thông tin bác sĩ
- Chỉnh sửa thông tin bác sĩ
- Xóa bác sĩ
- Upload avatar và chứng chỉ lên Cloudinary
- Tìm kiếm và lọc bác sĩ theo chuyên khoa

## 🎯 Tính năng

### 1. Danh sách Bác sĩ (ManageDoctorsScreen)
**Đường dẫn:** Admin Dashboard → Quản lý Bác sĩ

**Chức năng:**
- ✅ Hiển thị danh sách tất cả bác sĩ với phân trang (10 bác sĩ/trang)
- ✅ Tìm kiếm theo tên hoặc số điện thoại
- ✅ Lọc theo chuyên khoa
- ✅ Hiển thị trạng thái hoạt động (Hoạt động/Tạm dừng)
- ✅ Pull-to-refresh để tải lại dữ liệu
- ✅ Thống kê tổng số bác sĩ

**Các nút hành động:**
- 👁️ **Xem**: Xem chi tiết đầy đủ thông tin bác sĩ
- ✏️ **Sửa**: Chỉnh sửa thông tin bác sĩ
- ❌ **Xóa**: Xóa bác sĩ (soft delete)
- ➕ **Thêm**: Thêm bác sĩ mới

**Lưu ý:**
- ⚠️ Nút **Tắt/Bật** (toggle trạng thái) đã bị tắt theo yêu cầu

### 2. Thêm Bác sĩ (AddDoctorScreen)
**Đường dẫn:** Quản lý Bác sĩ → Nút ➕

**Thông tin bắt buộc:**
- Tên bác sĩ *
- Chuyên khoa *

**Thông tin tùy chọn:**
- Avatar (upload ảnh từ thư viện)
- Số năm kinh nghiệm
- Số điện thoại
- Zalo URL
- Địa chỉ phòng khám
- Tiểu sử

**Quy trình upload avatar:**
1. Nhập tên và chọn chuyên khoa
2. Nhấn "Chọn ảnh" để chọn avatar từ thư viện
3. Ảnh sẽ được hiển thị preview
4. Nhấn "Thêm bác sĩ" để tạo bác sĩ và upload avatar lên Cloudinary

**Validation:**
- Tên không được để trống
- Phải chọn chuyên khoa
- Số điện thoại phải có ít nhất 10 số

### 3. Sửa thông tin Bác sĩ (EditDoctorScreen)
**Đường dẫn:** Quản lý Bác sĩ → Nút ✏️

**Chức năng:**
- ✅ Hiển thị form với dữ liệu hiện tại của bác sĩ
- ✅ Cho phép thay đổi tất cả thông tin
- ✅ Upload avatar mới trực tiếp lên Cloudinary
- ✅ Validation giống như form thêm mới

**Quy trình upload avatar:**
1. Nhấn "Đổi ảnh" để chọn ảnh mới
2. Ảnh sẽ được upload ngay lập tức lên Cloudinary
3. URL ảnh mới sẽ được cập nhật vào database
4. Nhấn "Lưu thay đổi" để cập nhật các thông tin khác

### 4. Xem chi tiết Bác sĩ (DoctorDetailAdminScreen)
**Đường dẫn:** Quản lý Bác sĩ → Nút 👁️

**Hiển thị:**
- Avatar bác sĩ
- Trạng thái (Hoạt động/Tạm dừng)
- Thông tin cơ bản:
  - Chuyên khoa
  - Số năm kinh nghiệm
  - Số điện thoại
  - Zalo
  - Địa chỉ
  - Ngày tạo
- Tiểu sử đầy đủ
- Danh sách chứng chỉ (nếu có)

**Các nút hành động:**
- ✏️ **Sửa** (góc trên bên phải): Chuyển đến màn hình chỉnh sửa
- ❌ **Xóa bác sĩ** (cuối trang): Xóa bác sĩ với xác nhận

## 🔧 Backend API

### Danh sách API

#### 1. GET /api/Admin/Doctors
Lấy danh sách bác sĩ với phân trang và tìm kiếm
```
Query params:
- page: số trang (mặc định 1)
- pageSize: số bác sĩ/trang (mặc định 10)
- search: tìm kiếm theo tên hoặc SĐT
- specialtyId: lọc theo chuyên khoa
```

#### 2. GET /api/Admin/Doctors/{id}
Lấy chi tiết bác sĩ theo ID (bao gồm certificates)

#### 3. POST /api/Admin/Doctors
Tạo bác sĩ mới
```json
{
  "specialtyId": 1,
  "name": "Nguyễn Văn A",
  "experienceYears": 5,
  "phone": "0987654321",
  "zaloUrl": "https://zalo.me/...",
  "address": "123 ABC",
  "bioDetail": "Bác sĩ chuyên khoa...",
  "imageUrl": "https://..."
}
```

#### 4. PUT /api/Admin/Doctors/{id}
Cập nhật thông tin bác sĩ

#### 5. DELETE /api/Admin/Doctors/{id}
Xóa bác sĩ (soft delete - set IsDeleted = true)

#### 6. POST /api/Admin/Doctors/{doctorId}/upload-avatar
Upload avatar cho bác sĩ lên Cloudinary
```
Content-Type: multipart/form-data
Body: file (image file)
Folder: serochat/doctors
```

#### 7. POST /api/Admin/Doctors/{doctorId}/upload-certificate
Upload chứng chỉ cho bác sĩ lên Cloudinary
```
Content-Type: multipart/form-data
Body:
- certificateName (string)
- file (image/pdf file)
Folder: serochat/certificates
```

#### 8. DELETE /api/Admin/Doctors/certificates/{certId}
Xóa chứng chỉ

#### 9. GET /api/Admin/Doctors/specialties
Lấy danh sách chuyên khoa

#### 10. GET /api/Admin/Doctors/stats
Lấy thống kê (tổng bác sĩ, đang hoạt động, tạm dừng, theo chuyên khoa)

## ☁️ Cloudinary Integration

### Upload Avatar
- **Endpoint:** POST /api/Admin/Doctors/{doctorId}/upload-avatar
- **Folder:** serochat/doctors
- **Loại file:** JPG, JPEG, PNG
- **Xử lý:**
  1. Validate file type
  2. Upload lên Cloudinary
  3. Nhận về URL
  4. Cập nhật Doctor.ImageUrl trong database

### Upload Certificate
- **Endpoint:** POST /api/Admin/Doctors/{doctorId}/upload-certificate
- **Folder:** serochat/certificates
- **Loại file:** JPG, JPEG, PNG, PDF
- **Xử lý:**
  1. Validate file type
  2. Upload lên Cloudinary
  3. Nhận về URL
  4. Tạo record mới trong DoctorCertificate table

### Cấu hình Cloudinary Service
```csharp
public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file, string folder = "avatars");
    Task<bool> DeleteImageAsync(string publicId);
}
```

## 📱 Frontend Services

### doctorService.ts

**Admin Methods:**
```typescript
- adminGetDoctors(page, pageSize, search, specialtyId)
- adminGetDoctorById(doctorId)
- adminCreateDoctor(data)
- adminUpdateDoctor(doctorId, data)
- adminDeleteDoctor(doctorId)
- adminUploadAvatar(doctorId, imageUri)
- adminUploadCertificate(doctorId, certificateName, imageUri)
- adminDeleteCertificate(certId)
- adminGetSpecialties()
- adminGetStats()
```

**User Methods:**
```typescript
- getAllDoctors(specialtyId?)
- getDoctorById(doctorId)
- getSpecialties()
```

## 🗄️ Database Schema

### Doctor Table
```sql
- DoctorId (PK)
- SpecialtyId (FK)
- Name
- ExperienceYears
- Phone
- ZaloUrl
- Address
- BioDetail
- ImageUrl (Cloudinary URL)
- IsActive
- IsDeleted
- CreatedAt
```

### DoctorCertificate Table
```sql
- CertId (PK)
- DoctorId (FK)
- CertificateName
- ImageUrl (Cloudinary URL)
- UploadedAt
```

### Specialty Table
```sql
- SpecialtyId (PK)
- SpecialtyName
- Description
```

## 🔐 Phân quyền

**Yêu cầu:**
- Chỉ tài khoản có role = "ADMIN" mới được truy cập
- Kiểm tra role ở:
  - Frontend: MenuScreen.tsx (hiển thị menu admin)
  - Backend: [Authorize] attribute trên controller

## 📝 Navigation Routes

```typescript
App.tsx routes:
- ManageDoctors: ManageDoctorsScreen
- AddDoctor: AddDoctorScreen
- EditDoctor: EditDoctorScreen (params: doctorId)
- DoctorDetailAdmin: DoctorDetailAdminScreen (params: doctorId)
```

## ⚠️ Lưu ý quan trọng

1. **Toggle Status Disabled:**
   - Nút Tắt/Bật trạng thái đã bị comment out trong ManageDoctorsScreen.tsx
   - API toggle vẫn hoạt động nếu cần enable lại trong tương lai

2. **Avatar Upload:**
   - AddDoctorScreen: Chọn ảnh local → tạo doctor → upload ảnh
   - EditDoctorScreen: Upload ảnh ngay lập tức khi chọn

3. **Certificate Management:**
   - Backend API đã sẵn sàng
   - Frontend UI chưa có form upload certificate (có thể mở rộng)

4. **Soft Delete:**
   - Khi xóa bác sĩ, chỉ set IsDeleted = true
   - Không xóa vật lý khỏi database

5. **Image Picker:**
   - Cần cấp quyền truy cập thư viện ảnh
   - Chỉ chấp nhận định dạng ảnh

## 🚀 Hướng dẫn Test

### Test Add Doctor:
1. Login với tài khoản admin (admin@serochat.com / 123456)
2. Vào Menu → Dashboard Admin → Quản lý Bác sĩ
3. Nhấn nút ➕
4. Nhập thông tin: Tên, chọn chuyên khoa
5. (Tùy chọn) Nhấn "Chọn ảnh" để upload avatar
6. Nhấn "Thêm bác sĩ"
7. Kiểm tra avatar đã được upload lên Cloudinary

### Test Edit Doctor:
1. Ở danh sách bác sĩ, nhấn nút ✏️
2. Thay đổi thông tin
3. Nhấn "Đổi ảnh" để thay avatar (upload ngay lập tức)
4. Nhấn "Lưu thay đổi"
5. Quay lại danh sách, kiểm tra thông tin đã cập nhật

### Test View Doctor:
1. Ở danh sách bác sĩ, nhấn nút 👁️
2. Xem đầy đủ thông tin
3. Nhấn nút ✏️ ở góc phải để sửa
4. Hoặc nhấn "Xóa bác sĩ" để xóa

### Test Delete:
1. Nhấn nút ❌ Xóa
2. Xác nhận
3. Bác sĩ sẽ biến mất khỏi danh sách

## 🔍 Troubleshooting

**Lỗi: "Failed to upload avatar"**
- Kiểm tra Cloudinary service đã được config
- Kiểm tra file size không quá lớn
- Kiểm tra định dạng file hợp lệ

**Lỗi: "Failed to fetch doctors"**
- Kiểm tra backend API đang chạy
- Kiểm tra token authentication
- Kiểm tra database connection

**Avatar không hiển thị:**
- Kiểm tra Cloudinary URL có hợp lệ
- Kiểm tra quyền truy cập Cloudinary bucket
- Thử load trực tiếp URL trong browser

## 📞 Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Console logs (frontend)
2. API response (Network tab)
3. Backend logs
4. Database records
