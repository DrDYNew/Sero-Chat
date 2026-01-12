using System.Text.Json.Serialization;

namespace SeroChat_BE.DTOs.Payment
{
    public class CreatePaymentRequest
    {
        public int PlanId { get; set; }
        public string ReturnUrl { get; set; } = string.Empty;
        public string CancelUrl { get; set; } = string.Empty;
    }

    public class CreatePaymentResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public PaymentData? Data { get; set; }
    }

    public class PaymentData
    {
        public string CheckoutUrl { get; set; } = string.Empty;
        public string OrderCode { get; set; } = string.Empty;
        public int TransactionId { get; set; }
        public int Amount { get; set; }
        public string? QrCode { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
        public int? ExpiredAt { get; set; }
    }

    public class PayOSPaymentRequest
    {
        [JsonPropertyName("orderCode")]
        public long OrderCode { get; set; }
        
        [JsonPropertyName("amount")]
        public int Amount { get; set; }
        
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        
        [JsonPropertyName("items")]
        public List<PayOSItem> Items { get; set; } = new List<PayOSItem>();
        
        [JsonPropertyName("buyerName")]
        public string BuyerName { get; set; } = string.Empty;
        
        [JsonPropertyName("buyerEmail")]
        public string BuyerEmail { get; set; } = string.Empty;
        
        [JsonPropertyName("buyerPhone")]
        public string BuyerPhone { get; set; } = string.Empty;
        
        [JsonPropertyName("returnUrl")]
        public string ReturnUrl { get; set; } = string.Empty;
        
        [JsonPropertyName("cancelUrl")]
        public string CancelUrl { get; set; } = string.Empty;
        
        [JsonPropertyName("expiredAt")]
        public int? ExpiredAt { get; set; }
        
        [JsonPropertyName("signature")]
        public string? Signature { get; set; }
    }

    public class PayOSItem
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }
        
        [JsonPropertyName("price")]
        public int Price { get; set; }
    }

    public class PayOSPaymentResponse
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;
        
        [JsonPropertyName("desc")]
        public string Desc { get; set; } = string.Empty;
        
        [JsonPropertyName("data")]
        public PayOSData? Data { get; set; }
    }

    public class PayOSData
    {
        [JsonPropertyName("checkoutUrl")]
        public string CheckoutUrl { get; set; } = string.Empty;
        
        [JsonPropertyName("orderCode")]
        public long OrderCode { get; set; }
        
        [JsonPropertyName("paymentLinkId")]
        public string PaymentLinkId { get; set; } = string.Empty;
        
        [JsonPropertyName("qrCode")]
        public string? QrCode { get; set; }
        
        [JsonPropertyName("accountNumber")]
        public string? AccountNumber { get; set; }
        
        [JsonPropertyName("accountName")]
        public string? AccountName { get; set; }
    }

    public class PayOSWebhookData
    {
        public string OrderCode { get; set; } = string.Empty;
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public string TransactionDateTime { get; set; } = string.Empty;
        public string PaymentLinkId { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
    }

    public class VerifyPaymentRequest
    {
        public string OrderCode { get; set; } = string.Empty;
    }

    public class VerifyPaymentResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public TransactionStatus? Data { get; set; }
    }

    public class TransactionStatus
    {
        public int TransactionId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
