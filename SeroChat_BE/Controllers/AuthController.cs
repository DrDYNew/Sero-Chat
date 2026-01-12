using Microsoft.AspNetCore.Mvc;
using SeroChat_BE.DTOs.Auth;
using SeroChat_BE.Interfaces;

namespace SeroChat_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Đăng nhập bằng email và password
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var result = await _authService.LoginAsync(request);

                return Ok(new
                {
                    success = true,
                    message = "Đăng nhập thành công",
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Login failed for email: {Email}. Reason: {Reason}", request.Email, ex.Message);
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi trong quá trình đăng nhập"
                });
            }
        }

        /// <summary>
        /// Đăng ký tài khoản mới
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var result = await _authService.RegisterAsync(request);

                return Ok(new
                {
                    success = true,
                    message = "Đăng ký thành công",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Registration failed for email: {Email}. Reason: {Reason}", request.Email, ex.Message);
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi trong quá trình đăng ký"
                });
            }
        }

        /// <summary>
        /// Xác thực email qua token
        /// </summary>
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Token không hợp lệ"
                    });
                }

                var result = await _authService.VerifyEmailAsync(token);

                if (result)
                {
                    // Redirect đến trang success (có thể là deep link về app hoặc web page)
                    return Content(@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Xác thực thành công - Sero Chat</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
        }
        .success-icon {
            font-size: 80px;
            margin-bottom: 20px;
        }
        h1 {
            color: #10b981;
            margin-bottom: 10px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background: #8B5CF6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='success-icon'>✅</div>
        <h1>Xác thực thành công!</h1>
        <p>Tài khoản của bạn đã được kích hoạt.</p>
        <p>Bạn có thể đóng trang này và quay lại ứng dụng để bắt đầu sử dụng Sero Chat.</p>
        <a href='serochat://verified' class='button'>Quay lại ứng dụng</a>
    </div>
</body>
</html>", "text/html");
                }

                return BadRequest(new
                {
                    success = false,
                    message = "Xác thực không thành công"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Email verification failed. Reason: {Reason}", ex.Message);
                return Content($@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Xác thực thất bại - Sero Chat</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}
        .container {{
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
        }}
        .error-icon {{
            font-size: 80px;
            margin-bottom: 20px;
        }}
        h1 {{
            color: #ef4444;
            margin-bottom: 10px;
        }}
        p {{
            color: #666;
            line-height: 1.6;
            margin: 15px 0;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='error-icon'>❌</div>
        <h1>Xác thực thất bại</h1>
        <p>{ex.Message}</p>
        <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
    </div>
</body>
</html>", "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during email verification");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi trong quá trình xác thực email"
                });
            }
        }
    }
}
