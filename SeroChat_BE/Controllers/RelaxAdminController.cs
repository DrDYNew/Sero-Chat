using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;
using SeroChat_BE.Interfaces;

namespace SeroChat_BE.Controllers
{
    [Route("api/Admin/Relax")]
    [ApiController]
    public class RelaxAdminController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<RelaxAdminController> _logger;
        private readonly ICloudinaryService _cloudinaryService;

        public RelaxAdminController(SeroChatContext context, ILogger<RelaxAdminController> logger, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _logger = logger;
            _cloudinaryService = cloudinaryService;
        }

        /// <summary>
        /// Lấy danh sách relax assets (Admin)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetRelaxAssets(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? type = null)
        {
            try
            {
                var query = _context.RelaxAssets
                    .Where(a => a.IsDeleted != true);

                // Search by title
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(a => a.Title.Contains(search));
                }

                // Filter by type
                if (!string.IsNullOrWhiteSpace(type))
                {
                    query = query.Where(a => a.Type == type.ToUpper());
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                var assets = await query
                    .OrderByDescending(a => a.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new
                    {
                        a.AssetId,
                        a.Title,
                        a.Type,
                        a.MediaUrl,
                        a.ThumbnailUrl,
                        a.IsPremium,
                        a.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách relax assets thành công",
                    data = assets,
                    pagination = new
                    {
                        currentPage = page,
                        pageSize,
                        totalCount,
                        totalPages
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting relax assets");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách relax assets" });
            }
        }

        /// <summary>
        /// Lấy chi tiết relax asset (Admin)
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetRelaxAsset(int id)
        {
            try
            {
                var asset = await _context.RelaxAssets
                    .Where(a => a.AssetId == id && a.IsDeleted != true)
                    .Select(a => new
                    {
                        a.AssetId,
                        a.Title,
                        a.Type,
                        a.MediaUrl,
                        a.ThumbnailUrl,
                        a.IsPremium,
                        a.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (asset == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy relax asset" });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy thông tin relax asset thành công",
                    data = asset
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting relax asset by id: {AssetId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thông tin relax asset" });
            }
        }

        /// <summary>
        /// Tạo relax asset mới (Admin)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateRelaxAsset([FromBody] CreateRelaxAssetRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Title))
                {
                    return BadRequest(new { success = false, message = "Tiêu đề không được để trống" });
                }

                if (string.IsNullOrWhiteSpace(request.MediaUrl))
                {
                    return BadRequest(new { success = false, message = "MediaUrl không được để trống" });
                }

                // Validate type
                var validTypes = new[] { "MUSIC", "BREATHING", "MEDITATION" };
                if (!string.IsNullOrWhiteSpace(request.Type) && !validTypes.Contains(request.Type.ToUpper()))
                {
                    return BadRequest(new { success = false, message = "Type phải là MUSIC, BREATHING hoặc MEDITATION" });
                }

                var asset = new RelaxAsset
                {
                    Title = request.Title,
                    Type = request.Type?.ToUpper(),
                    MediaUrl = request.MediaUrl,
                    ThumbnailUrl = request.ThumbnailUrl,
                    IsPremium = request.IsPremium ?? false,
                    IsDeleted = false,
                    CreatedAt = DateTime.Now
                };

                _context.RelaxAssets.Add(asset);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Tạo relax asset thành công",
                    data = new
                    {
                        asset.AssetId,
                        asset.Title,
                        asset.Type,
                        asset.MediaUrl,
                        asset.ThumbnailUrl,
                        asset.IsPremium
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating relax asset");
                return StatusCode(500, new { success = false, message = "Lỗi khi tạo relax asset" });
            }
        }

        /// <summary>
        /// Cập nhật relax asset (Admin)
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateRelaxAsset(int id, [FromBody] UpdateRelaxAssetRequest request)
        {
            try
            {
                var asset = await _context.RelaxAssets.FirstOrDefaultAsync(a => a.AssetId == id && a.IsDeleted != true);
                if (asset == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy relax asset" });
                }

                // Update fields
                if (!string.IsNullOrWhiteSpace(request.Title))
                {
                    asset.Title = request.Title;
                }

                if (!string.IsNullOrWhiteSpace(request.Type))
                {
                    var validTypes = new[] { "MUSIC", "BREATHING", "MEDITATION" };
                    if (!validTypes.Contains(request.Type.ToUpper()))
                    {
                        return BadRequest(new { success = false, message = "Type phải là MUSIC, BREATHING hoặc MEDITATION" });
                    }
                    asset.Type = request.Type.ToUpper();
                }

                if (!string.IsNullOrWhiteSpace(request.MediaUrl))
                {
                    asset.MediaUrl = request.MediaUrl;
                }

                if (!string.IsNullOrWhiteSpace(request.ThumbnailUrl))
                {
                    asset.ThumbnailUrl = request.ThumbnailUrl;
                }

                if (request.IsPremium.HasValue)
                {
                    asset.IsPremium = request.IsPremium.Value;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật relax asset thành công",
                    data = new
                    {
                        asset.AssetId,
                        asset.Title,
                        asset.Type,
                        asset.MediaUrl,
                        asset.ThumbnailUrl,
                        asset.IsPremium
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating relax asset: {AssetId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi khi cập nhật relax asset" });
            }
        }

        /// <summary>
        /// Xóa relax asset (Admin)
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRelaxAsset(int id)
        {
            try
            {
                var asset = await _context.RelaxAssets.FirstOrDefaultAsync(a => a.AssetId == id && a.IsDeleted != true);
                if (asset == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy relax asset" });
                }

                // Soft delete
                asset.IsDeleted = true;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xóa relax asset thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting relax asset: {AssetId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi khi xóa relax asset" });
            }
        }

        /// <summary>
        /// Upload media (video/audio) lên Cloudinary (Admin)
        /// </summary>
        [HttpPost("upload-media")]
        public async Task<IActionResult> UploadMedia(IFormFile file, [FromForm] string type = "video")
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "Vui lòng chọn file" });
                }

                // Validate file type
                var allowedVideoTypes = new[] { "video/mp4", "video/quicktime", "video/x-msvideo" };
                var allowedAudioTypes = new[] { "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3" };
                
                if (type.ToLower() == "video" && !allowedVideoTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { success = false, message = "Chỉ chấp nhận file video MP4, MOV, AVI" });
                }
                
                if (type.ToLower() == "audio" && !allowedAudioTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { success = false, message = "Chỉ chấp nhận file audio MP3, WAV, OGG" });
                }

                // Upload lên Cloudinary
                var folder = type.ToLower() == "video" ? "serochat/relax/videos" : "serochat/relax/audios";
                var mediaUrl = await _cloudinaryService.UploadImageAsync(file, folder);

                return Ok(new
                {
                    success = true,
                    message = "Upload media thành công",
                    data = new { mediaUrl }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading media");
                return StatusCode(500, new { success = false, message = "Lỗi khi upload media" });
            }
        }

        /// <summary>
        /// Upload thumbnail lên Cloudinary (Admin)
        /// </summary>
        [HttpPost("upload-thumbnail")]
        public async Task<IActionResult> UploadThumbnail(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "Vui lòng chọn file ảnh" });
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png" };
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest(new { success = false, message = "Chỉ chấp nhận file JPG, JPEG, PNG" });
                }

                // Upload lên Cloudinary
                var thumbnailUrl = await _cloudinaryService.UploadImageAsync(file, "serochat/relax/thumbnails");

                return Ok(new
                {
                    success = true,
                    message = "Upload thumbnail thành công",
                    data = new { thumbnailUrl }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading thumbnail");
                return StatusCode(500, new { success = false, message = "Lỗi khi upload thumbnail" });
            }
        }

        /// <summary>
        /// Thống kê relax assets (Admin)
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalAssets = await _context.RelaxAssets.CountAsync(a => a.IsDeleted != true);
                var premiumAssets = await _context.RelaxAssets.CountAsync(a => a.IsDeleted != true && a.IsPremium == true);
                var freeAssets = totalAssets - premiumAssets;

                var typeStats = await _context.RelaxAssets
                    .Where(a => a.IsDeleted != true)
                    .GroupBy(a => a.Type)
                    .Select(g => new
                    {
                        type = g.Key,
                        count = g.Count()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy thống kê thành công",
                    data = new
                    {
                        totalAssets,
                        premiumAssets,
                        freeAssets,
                        typeStats
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting relax stats");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thống kê" });
            }
        }
    }

    #region DTOs

    public class CreateRelaxAssetRequest
    {
        public string Title { get; set; } = null!;
        public string? Type { get; set; }
        public string MediaUrl { get; set; } = null!;
        public string? ThumbnailUrl { get; set; }
        public bool? IsPremium { get; set; }
    }

    public class UpdateRelaxAssetRequest
    {
        public string? Title { get; set; }
        public string? Type { get; set; }
        public string? MediaUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public bool? IsPremium { get; set; }
    }

    #endregion
}
