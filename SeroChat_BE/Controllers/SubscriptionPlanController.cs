using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeroChat_BE.Models;

namespace SeroChat_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubscriptionPlanController : ControllerBase
    {
        private readonly SeroChatContext _context;
        private readonly ILogger<SubscriptionPlanController> _logger;

        public SubscriptionPlanController(SeroChatContext context, ILogger<SubscriptionPlanController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/SubscriptionPlan
        [HttpGet]
        public async Task<IActionResult> GetAllPlans()
        {
            try
            {
                var plans = await _context.SubscriptionPlans
                    .OrderBy(p => p.Price)
                    .Select(p => new
                    {
                        p.PlanId,
                        p.PlanName,
                        p.Price,
                        p.DurationDays,
                        p.DailyMessageLimit
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = plans });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subscription plans");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách gói dịch vụ" });
            }
        }

        // GET: api/SubscriptionPlan/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlanById(int id)
        {
            try
            {
                var plan = await _context.SubscriptionPlans
                    .Where(p => p.PlanId == id)
                    .Select(p => new
                    {
                        p.PlanId,
                        p.PlanName,
                        p.Price,
                        p.DurationDays,
                        p.DailyMessageLimit
                    })
                    .FirstOrDefaultAsync();

                if (plan == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy gói dịch vụ" });
                }

                return Ok(new { success = true, data = plan });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting plan by id");
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy thông tin gói dịch vụ" });
            }
        }

        // POST: api/SubscriptionPlan
        [HttpPost]
        public async Task<IActionResult> CreatePlan([FromBody] CreatePlanRequest request)
        {
            try
            {
                var plan = new SubscriptionPlan
                {
                    PlanName = request.PlanName,
                    Price = request.Price,
                    DurationDays = request.DurationDays,
                    DailyMessageLimit = request.DailyMessageLimit
                };

                _context.SubscriptionPlans.Add(plan);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Tạo gói dịch vụ thành công", data = new { planId = plan.PlanId } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating plan");
                return StatusCode(500, new { success = false, message = "Lỗi khi tạo gói dịch vụ" });
            }
        }

        // PUT: api/SubscriptionPlan/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlan(int id, [FromBody] UpdatePlanRequest request)
        {
            try
            {
                var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.PlanId == id);
                if (plan == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy gói dịch vụ" });
                }

                if (!string.IsNullOrEmpty(request.PlanName)) plan.PlanName = request.PlanName;
                if (request.Price.HasValue) plan.Price = request.Price.Value;
                if (request.DurationDays.HasValue) plan.DurationDays = request.DurationDays.Value;
                if (request.DailyMessageLimit.HasValue) plan.DailyMessageLimit = request.DailyMessageLimit.Value;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Cập nhật gói dịch vụ thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating plan");
                return StatusCode(500, new { success = false, message = "Lỗi khi cập nhật gói dịch vụ" });
            }
        }

        // DELETE: api/SubscriptionPlan/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(int id)
        {
            try
            {
                var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.PlanId == id);
                if (plan == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy gói dịch vụ" });
                }

                _context.SubscriptionPlans.Remove(plan);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xóa gói dịch vụ thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting plan");
                return StatusCode(500, new { success = false, message = "Lỗi khi xóa gói dịch vụ" });
            }
        }
    }

    public class CreatePlanRequest
    {
        public string PlanName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public int? DailyMessageLimit { get; set; }
    }

    public class UpdatePlanRequest
    {
        public string? PlanName { get; set; }
        public decimal? Price { get; set; }
        public int? DurationDays { get; set; }
        public int? DailyMessageLimit { get; set; }
    }
}
