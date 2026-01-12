using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<BlogController> _logger;

        public BlogController(SeroChatContext context, ILogger<BlogController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Blog
        [HttpGet]
        public async Task<IActionResult> GetAllBlogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null)
        {
            try
            {
                var skip = (page - 1) * pageSize;
                var query = _context.Blogs
                    .Include(b => b.BlogCat)
                    .Where(b => b.IsDeleted == false);

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(b =>
                        b.Title.Contains(search) ||
                        b.Content.Contains(search) ||
                        (b.AuthorName != null && b.AuthorName.Contains(search)));
                }

                if (categoryId.HasValue)
                {
                    query = query.Where(b => b.BlogCatId == categoryId);
                }

                var totalBlogs = await query.CountAsync();

                var blogs = await query
                    .OrderByDescending(b => b.CreatedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .Select(b => new
                    {
                        b.BlogId,
                        b.Title,
                        b.ThumbnailUrl,
                        b.AuthorName,
                        b.CreatedAt,
                        Category = new
                        {
                            b.BlogCat.BlogCatId,
                            b.BlogCat.CategoryName
                        }
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = blogs,
                    pagination = new
                    {
                        page,
                        pageSize,
                        totalItems = totalBlogs,
                        totalPages = (int)Math.Ceiling((double)totalBlogs / pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting blogs");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách blog" });
            }
        }

        // GET: api/Blog/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBlogById(int id)
        {
            try
            {
                var blog = await _context.Blogs
                    .Include(b => b.BlogCat)
                    .Where(b => b.BlogId == id && b.IsDeleted == false)
                    .Select(b => new
                    {
                        b.BlogId,
                        b.BlogCatId,
                        b.Title,
                        b.Content,
                        b.ThumbnailUrl,
                        b.AuthorName,
                        b.CreatedAt,
                        Category = new
                        {
                            b.BlogCat.BlogCatId,
                            b.BlogCat.CategoryName
                        }
                    })
                    .FirstOrDefaultAsync();

                if (blog == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy blog" });
                }

                return Ok(new { success = true, data = blog });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting blog by id");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thông tin blog" });
            }
        }

        // GET: api/Blog/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _context.BlogCategories
                    .Select(c => new
                    {
                        c.BlogCatId,
                        c.CategoryName,
                        c.Description
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = categories });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh mục" });
            }
        }

        // POST: api/Blog
        [HttpPost]
        public async Task<IActionResult> CreateBlog([FromBody] CreateBlogRequest request)
        {
            try
            {
                var blog = new Blog
                {
                    BlogCatId = request.BlogCatId,
                    Title = request.Title,
                    Content = request.Content,
                    ThumbnailUrl = request.ThumbnailUrl,
                    AuthorName = request.AuthorName,
                    CreatedAt = DateTime.Now,
                    IsDeleted = false
                };

                _context.Blogs.Add(blog);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Tạo blog thành công", data = new { blogId = blog.BlogId } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating blog");
                return StatusCode(500, new { success = false, message = "Lỗi khi tạo blog" });
            }
        }

        // PUT: api/Blog/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBlog(int id, [FromBody] UpdateBlogRequest request)
        {
            try
            {
                var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.BlogId == id && b.IsDeleted == false);
                if (blog == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy blog" });
                }

                if (request.BlogCatId.HasValue) blog.BlogCatId = request.BlogCatId.Value;
                if (!string.IsNullOrEmpty(request.Title)) blog.Title = request.Title;
                if (!string.IsNullOrEmpty(request.Content)) blog.Content = request.Content;
                if (request.ThumbnailUrl != null) blog.ThumbnailUrl = request.ThumbnailUrl;
                if (request.AuthorName != null) blog.AuthorName = request.AuthorName;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Cập nhật blog thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating blog");
                return StatusCode(500, new { success = false, message = "Lỗi khi cập nhật blog" });
            }
        }

        // DELETE: api/Blog/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            try
            {
                var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.BlogId == id && b.IsDeleted == false);
                if (blog == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy blog" });
                }

                blog.IsDeleted = true;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xóa blog thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting blog");
                return StatusCode(500, new { success = false, message = "Lỗi khi xóa blog" });
            }
        }
    }

    public class CreateBlogRequest
    {
        public int BlogCatId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string? AuthorName { get; set; }
    }

    public class UpdateBlogRequest
    {
        public int? BlogCatId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? AuthorName { get; set; }
    }
}
