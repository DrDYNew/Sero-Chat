using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using SeroChat_BE.DTOs.Payment;
using SeroChat_BE.Interfaces;
using SeroChat_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace SeroChat_BE.Services
{
    public class PayOSService : IPayOSService
    {
        private readonly SeroChatContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PayOSService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _checksumKey;
        private readonly string _baseUrl;

        public PayOSService(
            SeroChatContext context,
            IConfiguration configuration,
            ILogger<PayOSService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient();
            _apiKey = configuration["PayOSSettings:ApiKey"] ?? throw new Exception("PayOS ApiKey not configured");
            _checksumKey = configuration["PayOSSettings:ChecksumKey"] ?? throw new Exception("PayOS ChecksumKey not configured");
            _baseUrl = configuration["PayOSSettings:BaseUrl"] ?? "https://api-merchant.payos.vn";
        }

        public async Task<CreatePaymentResponse> CreatePaymentLink(int userId, CreatePaymentRequest request)
        {
            try
            {
                // Get user
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return new CreatePaymentResponse
                    {
                        Success = false,
                        Message = "Không tìm thấy người dùng"
                    };
                }

                // Get subscription plan
                var plan = await _context.SubscriptionPlans.FindAsync(request.PlanId);
                if (plan == null)
                {
                    return new CreatePaymentResponse
                    {
                        Success = false,
                        Message = "Không tìm thấy gói dịch vụ"
                    };
                }

                // Create transaction record
                var orderCode = long.Parse(GenerateOrderCode());
                var transaction = new Transaction
                {
                    OrderCode = orderCode,
                    UserId = userId,
                    PlanId = request.PlanId,
                    Amount = plan.Price,
                    PaymentMethod = "PayOS",
                    Status = "PENDING",
                    PaymentStatus = "Pending",
                    Description = $"Gói {plan.PlanName}",
                    CreatedAt = DateTime.Now
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                // Create PayOS payment request
                var payosRequest = new PayOSPaymentRequest
                {
                    OrderCode = orderCode,
                    Amount = (int)plan.Price,
                    Description = plan.PlanName.Length > 25 ? plan.PlanName.Substring(0, 25) : plan.PlanName,
                    Items = new List<PayOSItem>
                    {
                        new PayOSItem
                        {
                            Name = plan.PlanName,
                            Quantity = 1,
                            Price = (int)plan.Price
                        }
                    },
                    BuyerName = user.FullName ?? "Khách hàng",
                    BuyerEmail = user.Email,
                    BuyerPhone = user.PhoneNumber ?? "",
                    ReturnUrl = request.ReturnUrl,
                    CancelUrl = request.CancelUrl,
                    ExpiredAt = (int)DateTimeOffset.Now.AddMinutes(15).ToUnixTimeSeconds()
                };

                // Generate signature
                var signatureData = $"amount={payosRequest.Amount}&cancelUrl={payosRequest.CancelUrl}&description={payosRequest.Description}&orderCode={payosRequest.OrderCode}&returnUrl={payosRequest.ReturnUrl}";
                payosRequest.Signature = GenerateSignature(signatureData);

                // Call PayOS API
                var payosResponse = await CallPayOSApi(payosRequest);

                if (payosResponse != null && payosResponse.Code == "00")
                {
                    return new CreatePaymentResponse
                    {
                        Success = true,
                        Message = "Tạo link thanh toán thành công",
                        Data = new PaymentData
                        {
                            CheckoutUrl = payosResponse.Data?.CheckoutUrl ?? "",
                            OrderCode = payosResponse.Data?.OrderCode.ToString() ?? orderCode.ToString(),
                            TransactionId = (int)transaction.OrderCode,
                            QrCode = payosResponse.Data?.QrCode,
                            AccountNumber = payosResponse.Data?.AccountNumber,
                            AccountName = payosResponse.Data?.AccountName,
                            ExpiredAt = payosRequest.ExpiredAt,
                            Amount = (int)plan.Price
                        }
                    };
                }
                else
                {
                    transaction.Status = "CANCELLED";
                    transaction.PaymentStatus = "Failed";
                    await _context.SaveChangesAsync();

                    return new CreatePaymentResponse
                    {
                        Success = false,
                        Message = payosResponse?.Desc ?? "Không thể tạo link thanh toán"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment link");
                return new CreatePaymentResponse
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi tạo link thanh toán"
                };
            }
        }

        public async Task<VerifyPaymentResponse> VerifyPayment(string orderCode)
        {
            try
            {
                if (!long.TryParse(orderCode, out long code))
                {
                    return new VerifyPaymentResponse
                    {
                        Success = false,
                        Message = "Mã đơn hàng không hợp lệ"
                    };
                }

                var transaction = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.OrderCode == code);

                if (transaction == null)
                {
                    return new VerifyPaymentResponse
                    {
                        Success = false,
                        Message = "Không tìm thấy giao dịch"
                    };
                }

                return new VerifyPaymentResponse
                {
                    Success = true,
                    Data = new TransactionStatus
                    {
                        TransactionId = (int)transaction.OrderCode,
                        Status = transaction.PaymentStatus ?? "Pending",
                        Amount = transaction.Amount,
                        CompletedAt = transaction.TransactionDate
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying payment");
                return new VerifyPaymentResponse
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi kiểm tra thanh toán"
                };
            }
        }

        public async Task<bool> HandleWebhook(PayOSWebhookData webhookData)
        {
            try
            {
                if (!long.TryParse(webhookData.OrderCode, out long orderCode))
                {
                    _logger.LogWarning($"Invalid order code format: {webhookData.OrderCode}");
                    return false;
                }

                var transaction = await _context.Transactions
                    .Include(t => t.User)
                    .Include(t => t.Plan)
                    .FirstOrDefaultAsync(t => t.OrderCode == orderCode);

                if (transaction == null)
                {
                    _logger.LogWarning($"Transaction not found for order code: {webhookData.OrderCode}");
                    return false;
                }

                // Update transaction status based on webhook
                if (webhookData.Code == "00") // Success
                {
                    transaction.Status = "PAID";
                    transaction.PaymentStatus = "Completed";
                    transaction.TransactionDate = DateTime.Now;
                    transaction.PayOSTransactionId = webhookData.Reference;
                    transaction.StartDate = DateTime.Now;
                    transaction.EndDate = DateTime.Now.AddDays(transaction.Plan.DurationDays);

                    // Update user's subscription info
                    var user = transaction.User;
                    user.SubscriptionStatus = "PREMIUM";
                    user.PremiumExpiry = transaction.EndDate;

                    // Tạo notification
                    var notification = new Notification
                    {
                        UserId = user.UserId,
                        Title = "Nâng cấp Premium thành công",
                        Content = $"Chúc mừng! Bạn đã nâng cấp gói {transaction.Plan.PlanName}. Hạn sử dụng đến {transaction.EndDate?.ToString("dd/MM/yyyy")}",
                        IsRead = false,
                        CreatedAt = DateTime.Now
                    };
                    _context.Notifications.Add(notification);

                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Payment successful for order: {webhookData.OrderCode}");
                    return true;
                }
                else
                {
                    transaction.Status = "CANCELLED";
                    transaction.PaymentStatus = "Failed";
                    transaction.TransactionDate = DateTime.Now;
                    await _context.SaveChangesAsync();

                    _logger.LogWarning($"Payment failed for order: {webhookData.OrderCode}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling webhook");
                return false;
            }
        }

        private async Task<PayOSPaymentResponse?> CallPayOSApi(PayOSPaymentRequest request)
        {
            try
            {
                var jsonContent = JsonSerializer.Serialize(request, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                _logger.LogInformation($"PayOS Request: {jsonContent}");
                
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-client-id", _configuration["PayOSSettings:ClientId"]);
                _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);

                var response = await _httpClient.PostAsync($"{_baseUrl}/v2/payment-requests", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation($"PayOS Status Code: {response.StatusCode}");
                _logger.LogInformation($"PayOS Response: {responseContent}");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"PayOS API Error: {response.StatusCode} - {responseContent}");
                    return null;
                }

                var payosResponse = JsonSerializer.Deserialize<PayOSPaymentResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return payosResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling PayOS API");
                return null;
            }
        }

        private string GenerateOrderCode()
        {
            // Generate a unique order code using timestamp
            var timestamp = DateTimeOffset.Now.ToUnixTimeMilliseconds();
            return timestamp.ToString();
        }

        private string GenerateSignature(string data)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_checksumKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}
