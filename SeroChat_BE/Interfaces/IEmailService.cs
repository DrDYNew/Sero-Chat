namespace SeroChat_BE.Interfaces
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string toEmail, string fullName, string verificationToken);
        Task SendWelcomeEmailAsync(string toEmail, string fullName);
        Task SendPasswordResetEmailAsync(string toEmail, string fullName, string resetToken);
    }
}
