using Microsoft.AspNetCore.Mvc;
using SeroChat_BE.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace SeroChat_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly SeroChatContext _context;

        public HomeController(SeroChatContext context)
        {
            _context = context;
        }

        // Helper method to strip HTML tags and get plain text
        private string StripHtmlTags(string html)
        {
            if (string.IsNullOrEmpty(html))
                return string.Empty;

            // Remove HTML tags
            string strippedText = Regex.Replace(html, "<.*?>", string.Empty);
            
            // Decode HTML entities
            strippedText = System.Net.WebUtility.HtmlDecode(strippedText);
            
            // Replace multiple spaces/newlines with single space
            strippedText = Regex.Replace(strippedText, @"\s+", " ");
            
            return strippedText.Trim();
        }

        // GET: api/Home/affirmations/today
        [HttpGet("affirmations/today")]
        public async Task<ActionResult<DailyAffirmation>> GetTodayAffirmation()
        {
            var today = DateTime.Today;
            var affirmation = await _context.DailyAffirmations
                .Where(a => a.IsDeleted != true)
                .OrderBy(a => Guid.NewGuid())
                .FirstOrDefaultAsync();

            if (affirmation == null)
            {
                return NotFound(new { message = "No affirmation found" });
            }

            return Ok(affirmation);
        }

        // GET: api/Home/moods/user/{userId}/latest
        [HttpGet("moods/user/{userId}/latest")]
        public async Task<ActionResult<MoodLog>> GetLatestMood(int userId)
        {
            var mood = await _context.MoodLogs
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();

            if (mood == null)
            {
                return NotFound(new { message = "No mood log found" });
            }

            return Ok(mood);
        }

        // GET: api/Home/moods/user/{userId}
        [HttpGet("moods/user/{userId}")]
        public async Task<ActionResult<IEnumerable<MoodLog>>> GetUserMoods(int userId, [FromQuery] int limit = 7)
        {
            var moods = await _context.MoodLogs
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return Ok(moods);
        }

        // POST: api/Home/moods
        [HttpPost("moods")]
        public async Task<ActionResult<MoodLog>> CreateMoodLog([FromBody] MoodLog moodLog)
        {
            moodLog.CreatedAt = DateTime.Now;
            _context.MoodLogs.Add(moodLog);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLatestMood), new { userId = moodLog.UserId }, moodLog);
        }

        // GET: api/Home/relax/assets
        [HttpGet("relax/assets")]
        public async Task<ActionResult<IEnumerable<RelaxAsset>>> GetRelaxAssets([FromQuery] string? type = null)
        {
            var query = _context.RelaxAssets.Where(a => a.IsDeleted != true);

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(a => a.Type == type);
            }

            var assets = await query
                .OrderByDescending(a => a.CreatedAt)
                .Take(10)
                .ToListAsync();

            return Ok(assets);
        }

        // GET: api/Home/conversations/stats/{userId}
        [HttpGet("conversations/stats/{userId}")]
        public async Task<ActionResult> GetConversationStats(int userId)
        {
            var totalConversations = await _context.Conversations
                .Where(c => c.UserId == userId && c.IsDeleted != true)
                .CountAsync();

            var today = DateTime.Today;
            var todayConversations = await _context.Messages
                .Where(m => m.Conv.UserId == userId && m.SentAt >= today)
                .Select(m => m.ConvId)
                .Distinct()
                .CountAsync();

            // Calculate streak - consecutive days with at least one message
            int streak = 0;
            var currentDate = DateTime.Today;
            
            // Get all dates with messages in the last 30 days
            var datesWithMessages = await _context.Messages
                .Where(m => m.Conv.UserId == userId && 
                           m.SentAt >= DateTime.Today.AddDays(-30))
                .Select(m => m.SentAt.Value.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToListAsync();

            if (datesWithMessages.Any())
            {
                // Check if today has messages
                if (datesWithMessages.Contains(today))
                {
                    streak = 1;
                    currentDate = today.AddDays(-1);
                }
                else if (datesWithMessages.Contains(today.AddDays(-1)))
                {
                    // If no message today but has yesterday, start from yesterday
                    streak = 1;
                    currentDate = today.AddDays(-2);
                }
                else
                {
                    // No recent activity
                    return Ok(new
                    {
                        totalConversations,
                        todayConversations,
                        streak = 0
                    });
                }

                // Count consecutive days
                while (datesWithMessages.Contains(currentDate))
                {
                    streak++;
                    currentDate = currentDate.AddDays(-1);
                }
            }

            return Ok(new
            {
                totalConversations,
                todayConversations,
                streak
            });
        }

        // GET: api/Home/conversations/user/{userId}
        [HttpGet("conversations/user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserConversations(int userId, [FromQuery] int limit = 5)
        {
            var conversations = await _context.Conversations
                .Where(c => c.UserId == userId && c.IsDeleted != true)
                .OrderByDescending(c => c.CreatedAt)
                .Take(limit)
                .Select(c => new
                {
                    c.ConvId,
                    c.Title,
                    c.CreatedAt,
                    MessageCount = c.Messages.Count,
                    LastMessage = c.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(conversations);
        }

        // GET: api/Home/blogs/featured
        [HttpGet("blogs/featured")]
        public async Task<ActionResult<IEnumerable<object>>> GetFeaturedBlogs([FromQuery] int limit = 5)
        {
            var blogs = await _context.Blogs
                .Where(b => b.IsDeleted != true)
                .OrderByDescending(b => b.CreatedAt)
                .Take(limit)
                .ToListAsync();

            var result = blogs.Select(b =>
            {
                var plainText = StripHtmlTags(b.Content);
                return new
                {
                    b.BlogId,
                    b.Title,
                    Summary = plainText.Length > 200 ? plainText.Substring(0, 200) + "..." : plainText,
                    b.ThumbnailUrl,
                    b.CreatedAt,
                    CategoryName = b.BlogCat != null ? b.BlogCat.CategoryName : "Chung",
                    ReadTime = "5 phút đọc"
                };
            }).ToList();

            return Ok(result);
        }

        // GET: api/Home/blogs/all
        [HttpGet("blogs/all")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllBlogs([FromQuery] int? categoryId = null)
        {
            var query = _context.Blogs
                .Where(b => b.IsDeleted != true);

            // Filter by category if provided
            if (categoryId.HasValue)
            {
                query = query.Where(b => b.BlogCatId == categoryId.Value);
            }

            var blogs = await query
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var result = blogs.Select(b =>
            {
                var plainText = StripHtmlTags(b.Content);
                return new
                {
                    b.BlogId,
                    b.Title,
                    Summary = plainText.Length > 200 ? plainText.Substring(0, 200) + "..." : plainText,
                    b.ThumbnailUrl,
                    b.CreatedAt,
                    CategoryName = b.BlogCat != null ? b.BlogCat.CategoryName : "Chung",
                    CategoryId = b.BlogCatId,
                    ReadTime = "5 phút đọc"
                };
            }).ToList();

            return Ok(result);
        }

        // GET: api/Home/blogs/categories
        [HttpGet("blogs/categories")]
        public async Task<ActionResult<IEnumerable<object>>> GetBlogCategories()
        {
            var categories = await _context.BlogCategories
                .Select(c => new
                {
                    CategoryId = c.BlogCatId,
                    c.CategoryName,
                    c.Description
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/Home/blogs/{id}
        [HttpGet("blogs/{id}")]
        public async Task<ActionResult<object>> GetBlogById(int id)
        {
            var blog = await _context.Blogs
                .Where(b => b.BlogId == id && b.IsDeleted != true)
                .Select(b => new
                {
                    b.BlogId,
                    b.Title,
                    b.Content,
                    b.ThumbnailUrl,
                    b.CreatedAt,
                    b.AuthorName,
                    CategoryName = b.BlogCat != null ? b.BlogCat.CategoryName : "Chung",
                    CategoryId = b.BlogCatId,
                    ReadTime = "5 phút đọc"
                })
                .FirstOrDefaultAsync();

            if (blog == null)
            {
                return NotFound(new { message = "Blog not found" });
            }

            return Ok(blog);
        }

        // GET: api/Home/activities/recent/{userId}
        [HttpGet("activities/recent/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentActivities(int userId, [FromQuery] int limit = 5)
        {
            var activities = new List<object>();

            // Get recent conversations
            var conversations = await _context.Messages
                .Where(m => m.Conv.UserId == userId)
                .OrderByDescending(m => m.SentAt)
                .Take(3)
                .Select(m => new
                {
                    type = "conversation",
                    title = "Trò chuyện: " + (m.Conv.Title ?? "Cuộc trò chuyện mới"),
                    time = m.SentAt,
                    icon = "chat"
                })
                .ToListAsync();

            // Get recent mood logs
            var moods = await _context.MoodLogs
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(2)
                .Select(m => new
                {
                    type = "mood",
                    title = "Ghi nhận tâm trạng: " + GetMoodLabel(m.MoodScore),
                    time = m.CreatedAt,
                    icon = "emoticon-happy"
                })
                .ToListAsync();

            activities.AddRange(conversations);
            activities.AddRange(moods);

            var sortedActivities = activities
                .OrderByDescending(a => GetTimeProperty(a))
                .Take(limit)
                .Select((a, index) => new
                {
                    id = index + 1,
                    type = GetProperty<string>(a, "type"),
                    title = GetProperty<string>(a, "title"),
                    time = GetTimeAgo(GetTimeProperty(a)),
                    icon = GetProperty<string>(a, "icon")
                });

            return Ok(sortedActivities);
        }

        private string GetMoodLabel(int? score)
        {
            if (!score.HasValue) return "Chưa có";
            if (score >= 8) return "Rất tốt";
            if (score >= 6) return "Tốt";
            if (score >= 4) return "Bình thường";
            if (score >= 2) return "Không tốt";
            return "Rất tồi";
        }

        private string GetTimeAgo(DateTime? date)
        {
            if (!date.HasValue) return "Không xác định";

            var timeSpan = DateTime.Now - date.Value;

            if (timeSpan.TotalMinutes < 1) return "Vừa xong";
            if (timeSpan.TotalMinutes < 60) return $"{(int)timeSpan.TotalMinutes} phút trước";
            if (timeSpan.TotalHours < 24) return $"{(int)timeSpan.TotalHours} giờ trước";
            if (timeSpan.TotalDays < 7) return $"{(int)timeSpan.TotalDays} ngày trước";
            return date.Value.ToString("dd/MM/yyyy");
        }

        private DateTime? GetTimeProperty(object obj)
        {
            var prop = obj.GetType().GetProperty("time");
            return prop?.GetValue(obj) as DateTime?;
        }

        private T GetProperty<T>(object obj, string propertyName)
        {
            var prop = obj.GetType().GetProperty(propertyName);
            return (T)prop?.GetValue(obj);
        }
    }
}
