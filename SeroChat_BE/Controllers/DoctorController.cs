using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<DoctorController> _logger;

        public DoctorController(SeroChatContext context, ILogger<DoctorController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả bác sĩ
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllDoctors([FromQuery] int? specialtyId = null)
        {
            try
            {
                var query = _context.Doctors
                    .Where(d => d.IsActive == true && d.IsDeleted != true)
                    .Include(d => d.Specialty)
                    .Include(d => d.DoctorCertificates)
                    .AsQueryable();

                if (specialtyId.HasValue)
                {
                    query = query.Where(d => d.SpecialtyId == specialtyId.Value);
                }

                var doctors = await query
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(d => new
                    {
                        doctorId = d.DoctorId,
                        name = d.Name,
                        specialtyId = d.SpecialtyId,
                        specialtyName = d.Specialty.SpecialtyName,
                        experienceYears = d.ExperienceYears,
                        phone = d.Phone,
                        zaloUrl = d.ZaloUrl,
                        address = d.Address,
                        bioDetail = d.BioDetail,
                        imageUrl = d.ImageUrl,
                        certificateCount = d.DoctorCertificates.Count
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách bác sĩ thành công",
                    data = doctors
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting doctors list");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy danh sách bác sĩ"
                });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết bác sĩ
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorById(int id)
        {
            try
            {
                var doctor = await _context.Doctors
                    .Where(d => d.DoctorId == id && d.IsActive == true && d.IsDeleted != true)
                    .Include(d => d.Specialty)
                    .Include(d => d.DoctorCertificates)
                    .Select(d => new
                    {
                        doctorId = d.DoctorId,
                        name = d.Name,
                        specialtyId = d.SpecialtyId,
                        specialtyName = d.Specialty.SpecialtyName,
                        specialtyDescription = d.Specialty.Description,
                        experienceYears = d.ExperienceYears,
                        phone = d.Phone,
                        zaloUrl = d.ZaloUrl,
                        address = d.Address,
                        bioDetail = d.BioDetail,
                        imageUrl = d.ImageUrl,
                        certificates = d.DoctorCertificates.Select(c => new
                        {
                            certId = c.CertId,
                            certificateName = c.CertificateName,
                            imageUrl = c.ImageUrl,
                            uploadedAt = c.UploadedAt
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (doctor == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy bác sĩ"
                    });
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
                _logger.LogError(ex, "Error getting doctor detail for id: {DoctorId}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy thông tin bác sĩ"
                });
            }
        }

        /// <summary>
        /// Lấy danh sách chuyên khoa
        /// </summary>
        [HttpGet("specialties")]
        public async Task<IActionResult> GetSpecialties()
        {
            try
            {
                var specialties = await _context.Specialties
                    .Select(s => new
                    {
                        specialtyId = s.SpecialtyId,
                        specialtyName = s.SpecialtyName,
                        description = s.Description,
                        doctorCount = s.Doctors.Count(d => d.IsActive == true && d.IsDeleted != true)
                    })
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
                _logger.LogError(ex, "Error getting specialties list");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy danh sách chuyên khoa"
                });
            }
        }
    }
}
