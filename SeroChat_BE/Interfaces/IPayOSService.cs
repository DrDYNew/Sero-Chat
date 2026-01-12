using SeroChat_BE.DTOs.Payment;

namespace SeroChat_BE.Interfaces
{
    public interface IPayOSService
    {
        Task<CreatePaymentResponse> CreatePaymentLink(int userId, CreatePaymentRequest request);
        Task<VerifyPaymentResponse> VerifyPayment(string orderCode);
        Task<bool> HandleWebhook(PayOSWebhookData webhookData);
    }
}
