using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogsController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<BlogsController> _logger;

        public BlogsController(SeroChatContext context, ILogger<BlogsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách blogs đã lưu của user
        /// </summary>
        [HttpGet("saved/{userId}")]
        public async Task<IActionResult> GetSavedBlogs(int userId)
        {
            try
            {
                var savedBlogs = await _context.SavedBlogs
                    .Where(sb => sb.UserId == userId)
                    .Include(sb => sb.Blog)
                        .ThenInclude(b => b.BlogCat)
                    .OrderByDescending(sb => sb.SavedAt)
                    .Select(sb => new
                    {
                        blogId = sb.BlogId,
                        title = sb.Blog.Title,
                        thumbnailUrl = sb.Blog.ThumbnailUrl,
                        categoryName = sb.Blog.BlogCat.CategoryName,
                        authorName = sb.Blog.AuthorName,
                        createdAt = sb.Blog.CreatedAt,
                        savedAt = sb.SavedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách blog đã lưu thành công",
                    data = savedBlogs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting saved blogs for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy danh sách blog đã lưu"
                });
            }
        }

        /// <summary>
        /// Lưu blog
        /// </summary>
        [HttpPost("save")]
        public async Task<IActionResult> SaveBlog([FromBody] SaveBlogRequest request)
        {
            try
            {
                // Kiểm tra blog đã tồn tại chưa
                var existingSave = await _context.SavedBlogs
                    .FirstOrDefaultAsync(sb => sb.UserId == request.UserId && sb.BlogId == request.BlogId);

                if (existingSave != null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Blog đã được lưu trước đó"
                    });
                }

                var savedBlog = new SavedBlog
                {
                    UserId = request.UserId,
                    BlogId = request.BlogId,
                    SavedAt = DateTime.Now
                };

                _context.SavedBlogs.Add(savedBlog);
                await _context.SaveChangesAsync();

                // Lấy thông tin blog để tạo notification
                var blog = await _context.Blogs.FindAsync(request.BlogId);

                // Tạo notification
                var notification = new Notification
                {
                    UserId = request.UserId,
                    Title = "Đã lưu bài viết",
                    Content = $"Bạn đã lưu bài viết \"{blog?.Title ?? ""}\" để đọc sau",
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lưu blog thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving blog");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lưu blog"
                });
            }
        }

        /// <summary>
        /// Xóa blog đã lưu
        /// </summary>
        [HttpDelete("unsave/{userId}/{blogId}")]
        public async Task<IActionResult> UnsaveBlog(int userId, int blogId)
        {
            try
            {
                var savedBlog = await _context.SavedBlogs
                    .FirstOrDefaultAsync(sb => sb.UserId == userId && sb.BlogId == blogId);

                if (savedBlog == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy blog đã lưu"
                    });
                }

                _context.SavedBlogs.Remove(savedBlog);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Xóa blog đã lưu thành công"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unsaving blog");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi xóa blog đã lưu"
                });
            }
        }

        /// <summary>
        /// Lấy lịch sử đọc blog của user
        /// </summary>
        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetReadHistory(int userId)
        {
            try
            {
                var readHistory = await _context.BlogReadHistories
                    .Where(brh => brh.UserId == userId)
                    .Include(brh => brh.Blog)
                        .ThenInclude(b => b.BlogCat)
                    .OrderByDescending(brh => brh.ReadAt)
                    .Select(brh => new
                    {
                        blogId = brh.BlogId,
                        title = brh.Blog.Title,
                        thumbnailUrl = brh.Blog.ThumbnailUrl,
                        categoryName = brh.Blog.BlogCat.CategoryName,
                        authorName = brh.Blog.AuthorName,
                        createdAt = brh.Blog.CreatedAt,
                        readAt = brh.ReadAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    message = "Lấy lịch sử đọc thành công",
                    data = readHistory
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting read history for userId: {UserId}", userId);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy lịch sử đọc"
                });
            }
        }

        /// <summary>
        /// Thêm lịch sử đọc
        /// </summary>
        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkAsRead([FromBody] MarkReadRequest request)
        {
            try
            {
                // Kiểm tra xem đã có lịch sử đọc chưa
                var existingHistory = await _context.BlogReadHistories
                    .FirstOrDefaultAsync(brh => brh.UserId == request.UserId && brh.BlogId == request.BlogId);

                if (existingHistory != null)
                {
                    // Cập nhật thời gian đọc mới nhất
                    existingHistory.ReadAt = DateTime.Now;
                }
                else
                {
                    // Tạo lịch sử đọc mới
                    var readHistory = new BlogReadHistory
                    {
                        UserId = request.UserId,
                        BlogId = request.BlogId,
                        ReadAt = DateTime.Now
                    };
                    _context.BlogReadHistories.Add(readHistory);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Đã lưu lịch sử đọc"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking blog as read");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lưu lịch sử đọc"
                });
            }
        }

        /// <summary>
        /// Kiểm tra blog đã được lưu chưa
        /// </summary>
        [HttpGet("is-saved/{userId}/{blogId}")]
        public async Task<IActionResult> IsBlogSaved(int userId, int blogId)
        {
            try
            {
                var isSaved = await _context.SavedBlogs
                    .AnyAsync(sb => sb.UserId == userId && sb.BlogId == blogId);

                return Ok(new
                {
                    success = true,
                    isSaved = isSaved
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if blog is saved");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi"
                });
            }
        }
    }

    public class SaveBlogRequest
    {
        public int UserId { get; set; }
        public int BlogId { get; set; }
    }

    public class MarkReadRequest
    {
        public int UserId { get; set; }
        public int BlogId { get; set; }
    }
}
