using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeroChat_BE.DTOs.Payment;
using SeroChat_BE.Interfaces;
using System.Security.Claims;

namespace SeroChat_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPayOSService _payOSService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPayOSService payOSService, ILogger<PaymentController> logger)
        {
            _payOSService = payOSService;
            _logger = logger;
        }

        /// <summary>
        /// Create a payment link for subscription plan
        /// </summary>
        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Không xác thực được người dùng" });
                }

                var result = await _payOSService.CreatePaymentLink(userId, request);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, new { success = false, message = "Lỗi khi tạo thanh toán" });
            }
        }

        /// <summary>
        /// Verify payment status
        /// </summary>
        [HttpGet("verify/{orderCode}")]
        [Authorize]
        public async Task<IActionResult> VerifyPayment(string orderCode)
        {
            try
            {
                var result = await _payOSService.VerifyPayment(orderCode);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying payment");
                return StatusCode(500, new { success = false, message = "Lỗi khi kiểm tra thanh toán" });
            }
        }

        /// <summary>
        /// PayOS webhook endpoint
        /// </summary>
        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> PayOSWebhook([FromBody] PayOSWebhookData webhookData)
        {
            try
            {
                _logger.LogInformation($"Received webhook for order: {webhookData.OrderCode}");
                
                var result = await _payOSService.HandleWebhook(webhookData);
                
                if (result)
                {
                    return Ok(new { success = true, message = "Webhook processed successfully" });
                }
                
                return BadRequest(new { success = false, message = "Webhook processing failed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook");
                return StatusCode(500, new { success = false, message = "Lỗi khi xử lý webhook" });
            }
        }
    }
}
