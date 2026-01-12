using System.Net;
using System.Net.Mail;

namespace SeroChat_BE.Services
{
    public class EmailService : Interfaces.IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendVerificationEmailAsync(string toEmail, string fullName, string verificationToken)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var fromEmail = emailSettings["FromEmail"] ?? throw new InvalidOperationException("Email FromEmail not configured");
            var fromPassword = emailSettings["FromPassword"] ?? throw new InvalidOperationException("Email FromPassword not configured");
            var smtpHost = emailSettings["SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");

            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";
            var verificationLink = $"{baseUrl}/api/auth/verify-email?token={verificationToken}";

            var subject = "Xác thực tài khoản Sero Chat";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; padding: 15px 30px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🌟 Chào mừng đến với Sero Chat</h1>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Sero Chat</strong> - Người bạn đồng hành sức khỏe tâm lý của bạn!</p>
            <p>Để hoàn tất đăng ký và kích hoạt tài khoản, vui lòng nhấn vào nút bên dưới:</p>
            <div style='text-align: center;'>
                <a href='{verificationLink}' class='button'>✓ Xác thực tài khoản</a>
            </div>
            <p style='margin-top: 20px; padding: 15px; background: #fff; border-left: 4px solid #8B5CF6;'>
                <strong>Lưu ý:</strong> Link xác thực này sẽ hết hạn sau 24 giờ.
            </p>
            <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br><strong>Đội ngũ Sero Chat</strong></p>
        </div>
        <div class='footer'>
            <p>© 2026 Sero Chat. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không reply.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body, fromEmail, fromPassword, smtpHost, smtpPort);
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string fullName)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var fromEmail = emailSettings["FromEmail"] ?? throw new InvalidOperationException("Email FromEmail not configured");
            var fromPassword = emailSettings["FromPassword"] ?? throw new InvalidOperationException("Email FromPassword not configured");
            var smtpHost = emailSettings["SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");

            var subject = "Chào mừng đến với Sero Chat! 🎉";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .feature {{ background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #8B5CF6; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 Tài khoản đã được kích hoạt!</h1>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Tài khoản của bạn đã được xác thực thành công! Bây giờ bạn có thể bắt đầu hành trình chăm sóc sức khỏe tâm lý cùng <strong>Sero Chat</strong>.</p>
            
            <h3 style='color: #8B5CF6;'>🌟 Những gì bạn có thể làm:</h3>
            
            <div class='feature'>
                <strong>💬 Trò chuyện với AI</strong>
                <p>Chia sẻ tâm tư, cảm xúc với trợ lý AI thông minh và đồng cảm</p>
            </div>
            
            <div class='feature'>
                <strong>📝 Nhật ký tâm trạng</strong>
                <p>Ghi lại cảm xúc hàng ngày và theo dõi sức khỏe tinh thần</p>
            </div>
            
            <div class='feature'>
                <strong>📚 Thư viện kiến thức</strong>
                <p>Đọc các bài viết hữu ích về sức khỏe tâm lý</p>
            </div>
            
            <div class='feature'>
                <strong>🧘 Thư giãn & Thiền</strong>
                <p>Nghe nhạc thư giãn và thực hành các bài tập hít thở</p>
            </div>
            
            <div class='feature'>
                <strong>👨‍⚕️ Tìm chuyên gia</strong>
                <p>Kết nối với các bác sĩ tâm lý chuyên nghiệp khi cần</p>
            </div>
            
            <p style='margin-top: 20px;'>Hãy bắt đầu ngay hôm nay và trải nghiệm sự khác biệt!</p>
            <p>Chúc bạn có những trải nghiệm tuyệt vời! 💜</p>
            <p>Trân trọng,<br><strong>Đội ngũ Sero Chat</strong></p>
        </div>
        <div class='footer'>
            <p>© 2026 Sero Chat. All rights reserved.</p>
            <p>Nếu cần hỗ trợ, hãy liên hệ: support@serochat.com</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body, fromEmail, fromPassword, smtpHost, smtpPort);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string fullName, string resetToken)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var fromEmail = emailSettings["FromEmail"] ?? throw new InvalidOperationException("Email FromEmail not configured");
            var fromPassword = emailSettings["FromPassword"] ?? throw new InvalidOperationException("Email FromPassword not configured");
            var smtpHost = emailSettings["SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");

            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";
            var resetLink = $"{baseUrl}/api/auth/reset-password?token={resetToken}";

            var subject = "Đặt lại mật khẩu - Sero Chat";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; padding: 15px 30px; background: #EF4444; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
        .warning {{ background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔒 Đặt lại mật khẩu</h1>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Sero Chat của bạn.</p>
            <p>Để tạo mật khẩu mới, vui lòng nhấn vào nút bên dưới:</p>
            <div style='text-align: center;'>
                <a href='{resetLink}' class='button'>Đặt lại mật khẩu</a>
            </div>
            <div class='warning'>
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul>
                    <li>Link này sẽ hết hạn sau 1 giờ</li>
                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                    <li>Không chia sẻ link này với bất kỳ ai</li>
                </ul>
            </div>
            <p>Trân trọng,<br><strong>Đội ngũ Sero Chat</strong></p>
        </div>
        <div class='footer'>
            <p>© 2026 Sero Chat. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body, fromEmail, fromPassword, smtpHost, smtpPort);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body, 
            string fromEmail, string fromPassword, string smtpHost, int smtpPort)
        {
            try
            {
                using var message = new MailMessage();
                message.From = new MailAddress(fromEmail, "Sero Chat");
                message.To.Add(toEmail);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;

                using var smtpClient = new SmtpClient(smtpHost, smtpPort);
                smtpClient.EnableSsl = true;
                smtpClient.Credentials = new NetworkCredential(fromEmail, fromPassword);

                await smtpClient.SendMailAsync(message);
                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw new InvalidOperationException($"Không thể gửi email: {ex.Message}");
            }
        }
    }
}
