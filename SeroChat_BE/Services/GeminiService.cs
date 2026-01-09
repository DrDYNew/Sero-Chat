using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using SeroChat_BE.Interfaces;

namespace SeroChat_BE.Services;

public class GeminiService : IGeminiService
{
    private readonly string _apiKey;
    private readonly string _model;
    private readonly HttpClient _httpClient;
    private readonly string _systemPrompt;
    // In-memory conversation storage (session-based)
    private static readonly Dictionary<string, List<ConversationMessage>> _conversations = new();
    private static readonly object _conversationLock = new();

    public GeminiService(IConfiguration configuration, HttpClient httpClient)
    {
        _apiKey = configuration["GeminiSettings:ApiKey"] 
            ?? throw new InvalidOperationException("Gemini API Key not configured");
        _model = configuration["GeminiSettings:Model"] ?? "gemini-2.5-flash";
        _httpClient = httpClient;
        
        _systemPrompt = @"Bạn là SERO - Trợ lý tư vấn sức khỏe tâm lý AI, một người bạn tâm giao ấm áp và chuyên nghiệp.

🎯 VAI TRÒ CỦA BẠN:
Bạn là một nhà tư vấn tâm lý AI được đào tạo để:
- Lắng nghe với sự thấu hiểu sâu sắc, không phán xét
- Nhận biết và phản hồi các cảm xúc tinh tế trong lời nói
- Ghi nhớ các chi tiết quan trọng trong cuộc trò chuyện để tạo sự liên tục
- Đặt câu hỏi mở để người dùng chia sẻ sâu hơn
- Đưa ra lời khuyên dựa trên tâm lý học khoa học

💬 PHONG CÁCH GIAO TIẾP:
- Giọng điệu: Ấm áp, gần gũi, như một người bạn thân
- Ngôn ngữ: Tiếng Việt tự nhiên, dễ hiểu, tránh thuật ngữ phức tạp
- Độ dài: Câu trả lời ngắn gọn (2-4 câu), trừ khi cần giải thích kỹ
- Emoji: Sử dụng tinh tế để tạo cảm giác thân thiện 😊💙✨
- Tương tác: Luôn kết thúc bằng câu hỏi để duy trì cuộc trò chuyện

🧠 KỸ NĂNG CHUYÊN MÔN:
1. **Đồng cảm sâu sắc**: Phản ánh cảm xúc của người dùng
   Ví dụ: ""Mình hiểu bạn đang cảm thấy mệt mỏi quá phải không?""
   
2. **Ghi nhớ ngữ cảnh**: Tham chiếu những gì người dùng đã chia sẻ trước đó
   Ví dụ: ""Bạn vừa nói về áp lực công việc, chuyện đó vẫn còn làm bạn lo lắng à?""
   
3. **Kỹ thuật tâm lý thực tế**: 
   - Hít thở sâu, mindfulness, progressive muscle relaxation
   - Cognitive reframing (thay đổi cách nhìn)
   - Journaling (viết nhật ký cảm xúc)
   - Self-compassion (tự thương yêu bản thân)

4. **Nhận diện mức độ nghiêm trọng**:
   - Nhẹ: Căng thẳng hàng ngày → Lời khuyên self-care
   - Trung bình: Lo âu, buồn chán kéo dài → Khuyến khích tìm hỗ trợ
   - Nghiêm trọng: Trầm cảm, tự tử → KHẨN CẤP can thiệp

🚨 CẢNH BÁO KHỦNG HOẢNG - ƯU TIÊN CAO NHẤT:
Từ khóa khủng hoảng: tự tử, tự sát, chết đi, kết thúc, muốn chết, không muốn sống, tuyệt vọng quá, không còn ý nghĩa

KHI PHÁT HIỆN:
- **Bước 1**: Thể hiện quan tâm KHẨN CẤP và CHÂN THÀNH
  ""Mình rất lo lắng cho bạn. Cuộc sống của bạn vô cùng quý giá với mình 💙""
  
- **Bước 2**: Khẳng định giá trị của họ
  ""Bạn đang trải qua điều rất khó khăn, nhưng bạn KHÔNG đơn độc. Cảm xúc này là tạm thời.""
  
- **Bước 3**: KÊU GỌI MẠNH MẼ tìm giúp đỡ
  ""Hãy liên hệ ngay với chuyên gia tâm lý hoặc gọi đường dây nóng 1800 1234 (24/7 miễn phí).""
  
- **Bước 4**: Đưa ra hành động cụ thể
  ""Bạn có thể nói chuyện với người thân, hoặc để mình giới thiệu bác sĩ tâm lý trong app được không?""

❌ KHÔNG TRẢ LỜI:
- Cờ bạc, cá độ, xổ số, casino
- Bạo lực, tấn công người khác
- Chẩn đoán bệnh y khoa (""Bạn bị trầm cảm"", ""Đây là rối loạn lo âu"")
- Kê đơn thuốc hoặc khuyên dùng thuốc cụ thể
- Nội dung 18+, khiêu dâm

📝 CẤU TRÚC TRẢ LỜI LÝ TƯỞNG:
1. **Thừa nhận cảm xúc** (1 câu)
   ""Mình hiểu bạn đang cảm thấy... [cảm xúc]""
   
2. **Giải thích/Lời khuyên** (2-3 câu)
   Đưa ra insight hoặc kỹ thuật thực tế
   
3. **Câu hỏi mở** (1 câu)
   Khuyến khích chia sẻ thêm hoặc thử nghiệm kỹ thuật

VÍ DỤ TỐT:
User: ""Mình cảm thấy áp lực công việc quá""
SERO: ""Mình hiểu cảm giác bị nghiền nát bởi công việc đó 😔 Bạn thử dành 5 phút nghỉ ngơi, nhắm mắt hít thở sâu 3 lần được không? Đôi khi não bộ cần ""reset"" để làm việc hiệu quả hơn đấy. Áp lực đến từ deadline hay từ mối quan hệ đồng nghiệp vậy bạn? 🤔""

🎯 MỤC TIÊU CUỐI CÙNG:
Giúp người dùng cảm thấy được lắng nghe, được hiểu, và có hy vọng. Mỗi cuộc trò chuyện nên để lại cảm giác nhẹ nhõm hơn, dù chỉ một chút.
- Đầu tiên: Thể hiện sự thấu hiểu cảm xúc
- Tiếp theo: Đưa ra lời khuyên hoặc thông tin hữu ích
- Cuối cùng: Khuyến khích và truyền cảm hứng tích cực

Hãy bắt đầu cuộc trò chuyện với sự ấm áp và quan tâm chân thành! 💙";
    }

    public async Task<(string response, bool isCrisis)> SendMessageAsync(string message, int? userId)
    {
        try
        {
            // Tạo session key (userId hoặc guest)
            string sessionKey = userId?.ToString() ?? "guest_" + Guid.NewGuid().ToString();
            
            // Kiểm tra khủng hoảng tâm lý (ưu tiên cao nhất)
            bool isCrisis = await CheckCrisisKeywordsAsync(message);
            
            // Kiểm tra nội dung không phù hợp
            if (await CheckInappropriateContentAsync(message))
            {
                return ("Xin lỗi, tôi không thể trả lời câu hỏi này. SERO được thiết kế để hỗ trợ về sức khỏe tâm lý. Nếu bạn cần trò chuyện về cảm xúc hoặc tâm trạng, tôi luôn sẵn sàng lắng nghe bạn. 💙", false);
            }

            // Lấy hoặc tạo conversation history
            List<ConversationMessage> history;
            lock (_conversationLock)
            {
                if (!_conversations.ContainsKey(sessionKey))
                {
                    _conversations[sessionKey] = new List<ConversationMessage>();
                }
                history = _conversations[sessionKey];
                
                // Giữ tối đa 20 tin nhắn gần nhất (10 cặp hội đáp) để tiết kiệm tokens
                if (history.Count > 20)
                {
                    history = history.Skip(history.Count - 20).ToList();
                    _conversations[sessionKey] = history;
                }
            }

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

            // Build conversation contents
            var contentsList = new List<object>();
            
            // Thêm system prompt vào đầu cuộc trò chuyện
            contentsList.Add(new
            {
                role = "user",
                parts = new[] { new { text = _systemPrompt } }
            });
            contentsList.Add(new
            {
                role = "model",
                parts = new[] { new { text = "Chào bạn! Mình là SERO, trợ lý tâm lý của bạn. Mình ở đây để lắng nghe và đồng hành cùng bạn. Bạn có muốn chia sẻ điều gì không? 💙" } }
            });
            
            // Thêm lịch sử cuộc trò chuyện
            foreach (var msg in history)
            {
                contentsList.Add(new
                {
                    role = msg.Role,
                    parts = new[] { new { text = msg.Text } }
                });
            }
            
            // Thêm tin nhắn hiện tại
            contentsList.Add(new
            {
                role = "user",
                parts = new[] { new { text = message } }
            });

            var requestBody = new
            {
                contents = contentsList,
                generationConfig = new
                {
                    temperature = 0.9,
                    topK = 40,
                    topP = 0.95,
                    maxOutputTokens = 2048 // Tăng từ 1024 lên 2048 cho response dài hơn
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API Error: {response.StatusCode} - {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonDocument.Parse(responseContent);

            var text = jsonResponse.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            var aiResponse = text ?? "Xin lỗi, tôi không thể tạo phản hồi lúc này. Bạn có thể thử lại không? 😊";
            
            // Lưu vào conversation history
            lock (_conversationLock)
            {
                history.Add(new ConversationMessage
                {
                    Role = "user",
                    Text = message,
                    Timestamp = DateTime.UtcNow
                });
                history.Add(new ConversationMessage
                {
                    Role = "model",
                    Text = aiResponse,
                    Timestamp = DateTime.UtcNow
                });
            }

            return (aiResponse, isCrisis);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GeminiService: {ex.Message}");
            return ("Đã xảy ra lỗi khi xử lý tin nhắn. Vui lòng thử lại sau. 🙏", false);
        }
    }

    public async Task<bool> CheckInappropriateContentAsync(string message)
    {
        var lowerMessage = message.ToLower();
        
        var inappropriateKeywords = new[]
        {
            "cờ bạc", "đánh bạc", "cá độ", "casino", "xóc đĩa", "baccarat", "poker",
            "giết người", "giết ai", "đâm", "bạo lực", "đánh nhau",
            "ma túy", "thuốc lắc", "heroin", "cocaine"
        };

        return await Task.FromResult(inappropriateKeywords.Any(keyword => lowerMessage.Contains(keyword)));
    }

    public async Task<bool> CheckCrisisKeywordsAsync(string message)
    {
        var lowerMessage = message.ToLower();
        
        var crisisKeywords = new[]
        {
            "tự tử", "tự sát", "suicide", "muốn chết", "muốn kết thúc",
            "không muốn sống", "sống mệt mỏi quá", "đau khổ quá", "tuyệt vọng quá",
            "không còn hy vọng", "chán sống", "kết thúc cuộc đời", "không còn ý nghĩa",
            "tự làm hại", "tự hại", "muốn tự tử", "định tự tử", "sẽ tự tử"
        };

        return await Task.FromResult(crisisKeywords.Any(keyword => lowerMessage.Contains(keyword)));
    }

    private class ConversationMessage
    {
        public string Role { get; set; } = string.Empty; // "user" or "model"
        public string Text { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
