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
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository, 
            IConfiguration configuration,
            IEmailService emailService,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _emailService = emailService;
            _logger = logger;
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
            if (user.Status == "INACTIVE")
            {
                throw new UnauthorizedAccessException("Tài khoản của bạn đã bị khóa bởi quản trị viên");
            }

            // Kiểm tra tài khoản đã xác thực email chưa
            if (user.IsVerify == false)
            {
                throw new UnauthorizedAccessException("Tài khoản của bạn chưa được xác thực email. Vui lòng kiểm tra email để kích hoạt tài khoản");
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

            // Tạo verification token
            var verificationToken = GenerateVerificationToken(createdUser.UserId, createdUser.Email);

            // Gửi email xác thực
            try
            {
                await _emailService.SendVerificationEmailAsync(
                    createdUser.Email, 
                    createdUser.FullName ?? "Bạn", 
                    verificationToken
                );
                _logger.LogInformation("Verification email sent to {Email}", createdUser.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}", createdUser.Email);
                // Không throw exception, cho phép đăng ký thành công nhưng log lỗi
            }

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

        public string GenerateVerificationToken(int userId, string email)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
            var issuer = jwtSettings["Issuer"] ?? "SeroChat";
            var audience = jwtSettings["Audience"] ?? "SeroChat";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("userId", userId.ToString()),
                new Claim("email", email),
                new Claim("purpose", "email_verification"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24), // Token hết hạn sau 24h
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
                var issuer = jwtSettings["Issuer"] ?? "SeroChat";
                var audience = jwtSettings["Audience"] ?? "SeroChat";

                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
                
                var purposeClaim = principal.FindFirst("purpose")?.Value;
                if (purposeClaim != "email_verification")
                {
                    throw new UnauthorizedAccessException("Token không hợp lệ");
                }

                var userIdClaim = principal.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    throw new UnauthorizedAccessException("Token không hợp lệ");
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    throw new InvalidOperationException("Người dùng không tồn tại");
                }

                if (user.IsVerify == true)
                {
                    return true; // Đã verify rồi
                }

                // Cập nhật IsVerify = true
                user.IsVerify = true;
                await _userRepository.UpdateAsync(user);

                // Gửi email chào mừng
                try
                {
                    await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName ?? "Bạn");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
                }

                return true;
            }
            catch (SecurityTokenExpiredException)
            {
                throw new UnauthorizedAccessException("Token đã hết hạn");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email token");
                throw new UnauthorizedAccessException("Token không hợp lệ");
            }
        }
    }
}
