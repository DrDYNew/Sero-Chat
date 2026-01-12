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
    }
}
