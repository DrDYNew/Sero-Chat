namespace SeroChat_BE.Interfaces;

public interface IGeminiService
{
    Task<(string response, bool isCrisis)> SendMessageAsync(string message, int? userId);
    Task<bool> CheckInappropriateContentAsync(string message);
    Task<bool> CheckCrisisKeywordsAsync(string message);
}
