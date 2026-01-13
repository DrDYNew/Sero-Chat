using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;
using SeroChat_BE.Interfaces;

namespace SeroChat_BE.Controllers
{
    [Route("api/Admin/Doctors")]
    [ApiController]
    public class DoctorAdminController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<DoctorAdminController> _logger;
        private readonly ICloudinaryService _cloudinaryService;

        public DoctorAdminController(SeroChatContext context, ILogger<DoctorAdminController> logger, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _logger = logger;
            _cloudinaryService = cloudinaryService;
        }

        /// <summary>
        /// Lấy danh sách bác sĩ (Admin)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetDoctors(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string? search = null,
            [FromQuery] int? specialtyId = null,
            [FromQuery] bool? isActive = null)
        {
            try
            {
                var query = _context.Doctors
                    .Include(d => d.Specialty)
                    .Include(d => d.DoctorCertificates)
                    .Where(d => d.IsDeleted == false);

                // Search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(d => d.Name.Contains(search) || 
                                           (d.Phone != null && d.Phone.Contains(search)));
                }

                // Specialty filter
                if (specialtyId.HasValue)
                {
                    query = query.Where(d => d.SpecialtyId == specialtyId.Value);
                }

                // Active status filter
                if (isActive.HasValue)
                {
                    query = query.Where(d => d.IsActive == isActive.Value);
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                var doctors = await query
                    .OrderByDescending(d => d.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(d => new
                    {
                        d.DoctorId,
                        d.Name,
                        d.SpecialtyId,
                        specialtyName = d.Specialty.SpecialtyName,
                        d.ExperienceYears,
                        d.Phone,
                        d.ZaloUrl,
                        d.Address,
                        d.BioDetail,
                        d.ImageUrl,
                        d.IsActive,
                        d.CreatedAt,
                        certificatesCount = d.DoctorCertificates.Count
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách bác sĩ thành công",
                    data = doctors,
                    pagination = new
                    {
                        currentPage = page,
                        pageSize,
                        totalPages,
                        totalCount
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting doctors");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách bác sĩ" });
            }
        }

        /// <summary>
        /// Lấy danh sách chuyên khoa (Admin)
        /// </summary>
        [HttpGet("specialties")]
        public async Task<IActionResult> GetSpecialties()
        {
            try
            {
                var specialties = await _context.Specialties
                    .Select(s => new
                    {
                        s.SpecialtyId,
                        s.SpecialtyName,
                        s.Description,
                        doctorsCount = s.Doctors.Count(d => d.IsDeleted == false),
                        activeDoctorsCount = s.Doctors.Count(d => d.IsDeleted == false && d.IsActive == true)
                    })
                    .OrderBy(s => s.SpecialtyName)
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách chuyên khoa thành công",
                    data = specialties
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting specialties");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách chuyên khoa" });
            }
        }

        /// <summary>
        /// Lấy thống kê bác sĩ (Admin)
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalDoctors = await _context.Doctors.CountAsync(d => d.IsDeleted == false);
                var activeDoctors = await _context.Doctors.CountAsync(d => d.IsDeleted == false && d.IsActive == true);
                var inactiveDoctors = totalDoctors - activeDoctors;
                var specialtyStats = await _context.Specialties
                    .Select(s => new
                    {
                        s.SpecialtyName,
                        doctorCount = s.Doctors.Count(d => d.IsDeleted == false)
                    })
                    .OrderByDescending(s => s.doctorCount)
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy thống kê thành công",
                    data = new
                    {
                        totalDoctors,
                        activeDoctors,
                        inactiveDoctors,
                        specialtyStats
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting doctor stats");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thống kê bác sĩ" });
            }
        }

        /// <summary>
        /// Lấy chi tiết bác sĩ (Admin)
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetDoctor(int id)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Include(d => d.Specialty)
                    .Include(d => d.DoctorCertificates)
                    .Where(d => d.DoctorId == id && d.IsDeleted == false)
                    .Select(d => new
                    {
                        d.DoctorId,
                        d.Name,
                        d.SpecialtyId,
                        specialtyName = d.Specialty.SpecialtyName,
                        specialtyDescription = d.Specialty.Description,
                        d.ExperienceYears,
                        d.Phone,
                        d.ZaloUrl,
                        d.Address,
                        d.BioDetail,
                        d.ImageUrl,
                        d.IsActive,
                        d.CreatedAt,
                        certificates = d.DoctorCertificates.Select(c => new
                        {
                            c.CertId,
                            c.CertificateName,
                            c.ImageUrl,
                            c.UploadedAt
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (doctor == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bác sĩ" });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy thông tin bác sĩ thành công",
                    data = doctor
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting doctor by id: {DoctorId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thông tin bác sĩ" });
            }
        }

        /// <summary>
        /// Tạo bác sĩ mới (Admin)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorRequest request)
        {
            try
            {
                // Validate specialty exists
                var specialty = await _context.Specialties.FindAsync(request.SpecialtyId);
                if (specialty == null)
                {
                    return BadRequest(new { success = false, message = "Chuyên khoa không tồn tại" });
                }

                // Validate phone format if provided
                if (!string.IsNullOrEmpty(request.Phone) && request.Phone.Length < 10)
                {
                    return BadRequest(new { success = false, message = "Số điện thoại không hợp lệ" });
                }

                var doctor = new Doctor
                {
                    SpecialtyId = request.SpecialtyId,
                    Name = request.Name,
                    ExperienceYears = request.ExperienceYears,
                    Phone = request.Phone,
                    ZaloUrl = request.ZaloUrl,
                    Address = request.Address,
                    BioDetail = request.BioDetail,
                    ImageUrl = request.ImageUrl,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedAt = DateTime.Now
                };

                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Tạo bác sĩ thành công",
                    data = new
                    {
                        doctor.DoctorId,
                        doctor.Name,
                        doctor.SpecialtyId,
                        doctor.Phone,
                        doctor.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating doctor");
                return StatusCode(500, new { success = false, message = "Lỗi khi tạo bác sĩ" });
            }
        }

        /// <summary>
        /// Cập nhật bác sĩ (Admin)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, [FromBody] UpdateDoctorRequest request)
        {
            try
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorId == id && d.IsDeleted == false);
                if (doctor == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bác sĩ" });
                }

                // Validate specialty exists if changed
                if (request.SpecialtyId.HasValue && request.SpecialtyId != doctor.SpecialtyId)
                {
                    var specialty = await _context.Specialties.FindAsync(request.SpecialtyId.Value);
                    if (specialty == null)
                    {
                        return BadRequest(new { success = false, message = "Chuyên khoa không tồn tại" });
                    }
                    doctor.SpecialtyId = request.SpecialtyId.Value;
                }

                // Validate phone format if changed
                if (!string.IsNullOrEmpty(request.Phone) && request.Phone.Length < 10)
                {
                    return BadRequest(new { success = false, message = "Số điện thoại không hợp lệ" });
                }

                if (!string.IsNullOrEmpty(request.Name)) doctor.Name = request.Name;
                if (request.ExperienceYears.HasValue) doctor.ExperienceYears = request.ExperienceYears;
                if (request.Phone != null) doctor.Phone = request.Phone;
                if (request.ZaloUrl != null) doctor.ZaloUrl = request.ZaloUrl;
                if (request.Address != null) doctor.Address = request.Address;
                if (request.BioDetail != null) doctor.BioDetail = request.BioDetail;
                if (request.ImageUrl != null) doctor.ImageUrl = request.ImageUrl;
                if (request.IsActive.HasValue) doctor.IsActive = request.IsActive;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật bác sĩ thành công",
                    data = new
                    {
                        doctor.DoctorId,
                        doctor.Name,
                        doctor.Phone,
                        doctor.IsActive
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating doctor: {DoctorId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi khi cập nhật bác sĩ" });
            }
        }

        /// <summary>
        /// Xóa bác sĩ (Soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            try
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorId == id && d.IsDeleted == false);
                if (doctor == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bác sĩ" });
                }

                // Soft delete
                doctor.IsDeleted = true;
                doctor.IsActive = false;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xóa bác sĩ thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting doctor: {DoctorId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi khi xóa bác sĩ" });
            }
        }

        /// <summary>
        /// Kích hoạt/vô hiệu hóa bác sĩ
        /// </summary>
        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            try
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorId == id && d.IsDeleted == false);
                if (doctor == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bác sĩ" });
                }

                doctor.IsActive = !(doctor.IsActive ?? false);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = (doctor.IsActive ?? false) ? "Đã kích hoạt bác sĩ" : "Đã vô hiệu hóa bác sĩ",
                    data = new { doctor.DoctorId, doctor.IsActive }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling doctor active status: {DoctorId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi khi thay đổi trạng thái bác sĩ" });
            }
        }

        /// <summary>
        /// Upload avatar cho bác sĩ (Admin)
        /// </summary>
        [HttpPost("{doctorId:int}/upload-avatar")]
        public async Task<IActionResult> UploadDoctorAvatar(int doctorId, IFormFile file)
        {
            try
            {
                var doctor = await _context.Doctors.FindAsync(doctorId);
                if (doctor == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bác sĩ" });
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "Vui lòng chọn file ảnh" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { success = false, message = "Chỉ chấp nhận file JPG, JPEG hoặc PNG" });
                }

                // Upload ảnh lên Cloudinary
                var avatarUrl = await _cloudinaryService.UploadImageAsync(file, "serochat/doctors");
                
                // Cập nhật URL avatar
                doctor.ImageUrl = avatarUrl;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Upload avatar thành công",
                    data = new { imageUrl = avatarUrl }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading doctor avatar");
                return StatusCode(500, new { success = false, message = "Lỗi khi upload avatar" });
            }
        }

        /// <summary>
        /// Upload chứng chỉ cho bác sĩ (Admin)
        /// </summary>
        [HttpPost("{doctorId:int}/upload-certificate")]
        public async Task<IActionResult> UploadCertificate(int doctorId, [FromForm] string certificateName, IFormFile file)
        {
            try
            {
                var doctor = await _context.Doctors.FindAsync(doctorId);
                if (doctor == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy bác sĩ" });
                }

                if (string.IsNullOrWhiteSpace(certificateName))
                {
                    return BadRequest(new { success = false, message = "Vui lòng nhập tên chứng chỉ" });
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "Vui lòng chọn file ảnh" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "application/pdf" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { success = false, message = "Chỉ chấp nhận file JPG, JPEG, PNG hoặc PDF" });
                }

                // Upload ảnh lên Cloudinary
                var imageUrl = await _cloudinaryService.UploadImageAsync(file, "serochat/certificates");
                
                // Tạo bản ghi chứng chỉ mới
                var certificate = new DoctorCertificate
                {
                    DoctorId = doctorId,
                    CertificateName = certificateName,
                    ImageUrl = imageUrl,
                    UploadedAt = DateTime.Now
                };

                _context.DoctorCertificates.Add(certificate);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Upload chứng chỉ thành công",
                    data = new
                    {
                        certId = certificate.CertId,
                        certificateName = certificate.CertificateName,
                        imageUrl = certificate.ImageUrl,
                        uploadedAt = certificate.UploadedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading certificate");
                return StatusCode(500, new { success = false, message = "Lỗi khi upload chứng chỉ" });
            }
        }

        /// <summary>
        /// Xóa chứng chỉ (Admin)
        /// </summary>
        [HttpDelete("certificates/{certId:int}")]
        public async Task<IActionResult> DeleteCertificate(int certId)
        {
            try
            {
                var certificate = await _context.DoctorCertificates.FindAsync(certId);
                if (certificate == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy chứng chỉ" });
                }

                _context.DoctorCertificates.Remove(certificate);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đã xóa chứng chỉ"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting certificate");
                return StatusCode(500, new { success = false, message = "Lỗi khi xóa chứng chỉ" });
            }
        }
    }

    #region DTOs

    public class CreateDoctorRequest
    {
        public int SpecialtyId { get; set; }
        public string Name { get; set; } = null!;
        public int? ExperienceYears { get; set; }
        public string? Phone { get; set; }
        public string? ZaloUrl { get; set; }
        public string? Address { get; set; }
        public string? BioDetail { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateDoctorRequest
    {
        public int? SpecialtyId { get; set; }
        public string? Name { get; set; }
        public int? ExperienceYears { get; set; }
        public string? Phone { get; set; }
        public string? ZaloUrl { get; set; }
        public string? Address { get; set; }
        public string? BioDetail { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
    }

    #endregion
}
