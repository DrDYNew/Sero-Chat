using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SeroChat_BE.DTOs.Auth;
using SeroChat_BE.Interfaces;
using SeroChat_BE.Models;
using BCrypt.Net;

namespace SeroChat_BE.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            // Kiểm tra user tồn tại
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");
            }

            // Kiểm tra auth provider (không cho phép login LOCAL với tài khoản Google)
            if (user.AuthProvider != "LOCAL")
            {
                throw new UnauthorizedAccessException("Tài khoản này đăng ký bằng Google. Vui lòng đăng nhập bằng Google");
            }

            // Kiểm tra password
            if (string.IsNullOrEmpty(user.PasswordHash) || !VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");
            }

            // Kiểm tra tài khoản có bị khóa không
            if (user.Status == "SUSPENDED")
            {
                throw new UnauthorizedAccessException("Tài khoản của bạn đã bị tạm khóa");
            }

            if (user.Status == "INACTIVE")
            {
                throw new UnauthorizedAccessException("Tài khoản của bạn chưa được kích hoạt");
            }

            // Tạo JWT token
            var token = GenerateJwtToken(user.UserId, user.Email, user.Role ?? "USER");

            return new LoginResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName ?? "",
                AvatarUrl = user.AvatarUrl,
                Role = user.Role ?? "USER",
                SubscriptionStatus = user.SubscriptionStatus ?? "FREE",
                Token = token,
                PremiumExpiry = user.PremiumExpiry
            };
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // Kiểm tra email đã tồn tại
            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                throw new InvalidOperationException("Email đã được sử dụng");
            }

            // Hash password
            var passwordHash = HashPassword(request.Password);

            // Tạo user mới
            var newUser = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                AuthProvider = "LOCAL",
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Role = "USER",
                SubscriptionStatus = "FREE",
                Status = "ACTIVE",
                IsVerify = false,
                IsDeleted = false,
                CreatedAt = DateTime.Now,
                Theme = "LIGHT",
                Language = "vi"
            };

            var createdUser = await _userRepository.CreateAsync(newUser);

            // Tạo JWT token
            var token = GenerateJwtToken(createdUser.UserId, createdUser.Email, createdUser.Role ?? "USER");

            return new LoginResponseDto
            {
                UserId = createdUser.UserId,
                Email = createdUser.Email,
                FullName = createdUser.FullName ?? "",
                AvatarUrl = createdUser.AvatarUrl,
                Role = createdUser.Role ?? "USER",
                SubscriptionStatus = createdUser.SubscriptionStatus ?? "FREE",
                Token = token,
                PremiumExpiry = createdUser.PremiumExpiry
            };
        }

        public string GenerateJwtToken(int userId, string email, string role)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
            var issuer = jwtSettings["Issuer"] ?? "SeroChat";
            var audience = jwtSettings["Audience"] ?? "SeroChat";
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "1440"); // Default 24h

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }
}
