# Hệ thống Thanh toán PayOS - Sero Chat

## Tổng quan

Hệ thống thanh toán được tích hợp với PayOS để xử lý các giao dịch đăng ký gói dịch vụ Premium.

## Cấu trúc Backend

### 1. Configuration (appsettings.json)
```json
"PayOSSettings": {
  "ClientId": "5a6d3cf0-a773-4383-a422-26f20d592306",
  "ApiKey": "a933a3ef-8981-4781-841d-f655b51bf714",
  "ChecksumKey": "bf3f536d8c7b5c3af5e87953f9ee69e8092e586f5857a0df32e0884081295ae9",
  "WebhookUrl": "https://unprofiteering-imperceptibly-krystle.ngrok-free.dev/api/payos/webhook",
  "BaseUrl": "https://api-merchant.payos.vn"
}
```

### 2. Models
- **PaymentTransaction.cs**: Model lưu trữ thông tin giao dịch thanh toán
  - TransactionId, UserId, PlanId, Amount
  - PaymentMethod, Status (Pending/Success/Failed/Cancelled)
  - PayOSOrderCode, PayOSTransactionId
  - CreatedAt, CompletedAt, Description

### 3. DTOs (Payment/PaymentDtos.cs)
- **CreatePaymentRequest**: Request tạo thanh toán
- **CreatePaymentResponse**: Response chứa checkout URL
- **PayOSWebhookData**: Webhook data từ PayOS
- **VerifyPaymentRequest/Response**: Kiểm tra trạng thái thanh toán

### 4. Services
- **IPayOSService**: Interface định nghĩa các method
- **PayOSService**: Implementation xử lý logic thanh toán
  - `CreatePaymentLink()`: Tạo link thanh toán PayOS
  - `VerifyPayment()`: Kiểm tra trạng thái giao dịch
  - `HandleWebhook()`: Xử lý webhook từ PayOS

### 5. Controllers
- **PaymentController.cs**: API endpoints
  - `POST /api/Payment/create`: Tạo thanh toán
  - `GET /api/Payment/verify/{orderCode}`: Kiểm tra thanh toán
  - `POST /api/Payment/webhook`: Webhook endpoint

## Cấu trúc Frontend

### 1. Services
- **paymentService.ts**: Service gọi API thanh toán
  - `createPayment()`: Tạo thanh toán mới
  - `verifyPayment()`: Kiểm tra trạng thái

### 2. Screens
- **PaymentScreen.tsx**: Màn hình thanh toán
  - Hiển thị thông tin gói đăng ký
  - Phương thức thanh toán (PayOS)
  - Nút thanh toán và xác nhận

- **SubscriptionPlansScreen.tsx**: Màn hình danh sách gói
  - Hiển thị các gói đăng ký
  - Navigate sang PaymentScreen khi chọn gói

## Luồng hoạt động

### 1. Tạo thanh toán
```
User chọn gói → PaymentScreen → API create payment → PayOS checkout URL → Open browser
```

### 2. Xử lý thanh toán
```
User thanh toán trên PayOS → PayOS gửi webhook → Backend cập nhật trạng thái → Kích hoạt gói
```

### 3. Xác nhận thanh toán
```
User quay lại app → Verify payment → Hiển thị trạng thái → Navigate về Home
```

## Database Migration

Chạy SQL script để tạo bảng PaymentTransactions:

```bash
# Trong SQL Server Management Studio hoặc sqlcmd
sqlcmd -S (local) -d SeroChat -U sa -P 123 -i "Migrations/AddPaymentTransactionsTable.sql"
```

Hoặc copy nội dung file SQL và execute trong SSMS.

## Cài đặt và Chạy

### Backend

1. Cập nhật connection string trong appsettings.json
2. Chạy migration SQL
3. Build và chạy project:
```bash
cd SeroChat_BE
dotnet restore
dotnet build
dotnet run
```

### Frontend

1. Install dependencies:
```bash
cd SeroChat_FE
npm install
```

2. Chạy app:
```bash
npm start
```

## Testing

### Test Payment Flow

1. Chạy backend và frontend
2. Đăng nhập vào app
3. Vào Menu → Gói dịch vụ Premium
4. Chọn một gói → Đăng ký ngay
5. Màn hình thanh toán hiển thị
6. Nhấn "Thanh toán ngay"
7. Browser mở PayOS checkout
8. Quét QR code để thanh toán
9. Sau khi thanh toán, nhấn "Kiểm tra thanh toán"
10. Xác nhận gói đã được kích hoạt

### Test Webhook

Webhook URL cần được expose ra internet. Sử dụng ngrok:

```bash
ngrok http 5000
```

Cập nhật WebhookUrl trong appsettings.json với URL từ ngrok.

## API Endpoints

### Create Payment
```http
POST /api/Payment/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "planId": 1,
  "returnUrl": "http://localhost:5000/payment/success",
  "cancelUrl": "http://localhost:5000/payment/cancel"
}
```

### Verify Payment
```http
GET /api/Payment/verify/{orderCode}
Authorization: Bearer {token}
```

### Webhook (Called by PayOS)
```http
POST /api/Payment/webhook
Content-Type: application/json

{
  "orderCode": "1234567890",
  "amount": 100000,
  "code": "00",
  "desc": "success",
  ...
}
```

## Notes

- PayOS sử dụng QR Code để thanh toán qua ngân hàng
- Webhook được gọi tự động khi thanh toán thành công
- Transaction status: Pending → Success/Failed
- Free plans không cần thanh toán, kích hoạt ngay lập tức
- Paid plans cần thanh toán qua PayOS trước khi kích hoạt

## Troubleshooting

### Lỗi không tạo được payment link
- Kiểm tra PayOS credentials trong appsettings.json
- Verify API key và Client ID
- Check logs trong console

### Webhook không nhận được
- Verify webhook URL đã được expose ra internet (dùng ngrok)
- Check firewall settings
- Kiểm tra logs trong PayOS dashboard

### Payment không được verify
- Đảm bảo orderCode đúng
- Check database có transaction record không
- Verify user đã đăng nhập

## Security

- API keys được lưu trong appsettings.json (không commit lên git)
- JWT token required cho các payment endpoints
- Webhook có checksum validation
- HTTPS required cho production

## Production Deployment

1. Thay đổi ngrok URL thành domain thật
2. Setup SSL certificate
3. Update PayOS webhook URL trong dashboard
4. Monitor logs và transactions
5. Setup backup cho database

---

**Developed for Sero Chat - Mental Health Support Platform**
