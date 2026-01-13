using Microsoft.AspNetCore.Http;

namespace SeroChat_BE.Interfaces
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file, string folder = "avatars");
        Task<bool> DeleteImageAsync(string publicId);
    }
}
