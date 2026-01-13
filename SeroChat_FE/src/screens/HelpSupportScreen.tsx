import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpSupportScreen = ({ navigation }: any) => {
  const { colors, isDarkMode } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tất cả', icon: 'view-grid' },
    { id: 'account', label: 'Tài khoản', icon: 'account' },
    { id: 'chat', label: 'Trò chuyện', icon: 'message' },
    { id: 'premium', label: 'Premium', icon: 'crown' },
    { id: 'security', label: 'Bảo mật', icon: 'shield' },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      category: 'account',
      question: 'Làm sao để tạo tài khoản?',
      answer: 'Bạn có thể tạo tài khoản bằng cách nhấn vào nút "Đăng ký" trên màn hình đăng nhập. Điền email, mật khẩu và thông tin cá nhân, sau đó xác nhận email để hoàn tất đăng ký.',
    },
    {
      id: '2',
      category: 'account',
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer: 'Nhấn vào "Quên mật khẩu" trên màn hình đăng nhập, nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn.',
    },
    {
      id: '3',
      category: 'chat',
      question: 'AI chatbot có thay thế được bác sĩ không?',
      answer: 'Không, AI chatbot là công cụ hỗ trợ tâm lý cơ bản, không thay thế được bác sĩ hoặc chuyên gia tâm lý. Nếu bạn gặp vấn đề nghiêm trọng, hãy tìm kiếm sự trợ giúp chuyên nghiệp.',
    },
    {
      id: '4',
      category: 'chat',
      question: 'Số tin nhắn miễn phí là bao nhiêu?',
      answer: 'Tài khoản miễn phí có 50 tin nhắn/tháng. Sau khi hết hạn mức, bạn cần nâng cấp Premium để tiếp tục sử dụng.',
    },
    {
      id: '5',
      category: 'premium',
      question: 'Gói Premium có những lợi ích gì?',
      answer: 'Premium mang lại: Không giới hạn tin nhắn AI, ưu tiên phản hồi nhanh, truy cập nội dung độc quyền, không quảng cáo, và nhiều tính năng đặc biệt khác.',
    },
    {
      id: '6',
      category: 'premium',
      question: 'Làm sao để hủy gói Premium?',
      answer: 'Vào Menu > Gói dịch vụ Premium > Quản lý đăng ký > Hủy đăng ký. Bạn vẫn sử dụng được Premium cho đến hết chu kỳ thanh toán hiện tại.',
    },
    {
      id: '7',
      category: 'security',
      question: 'Dữ liệu của tôi có được bảo mật không?',
      answer: 'Có, chúng tôi sử dụng mã hóa end-to-end cho tất cả cuộc trò chuyện. Dữ liệu cá nhân tuân thủ GDPR và không bao giờ được chia sẻ với bên thứ ba.',
    },
    {
      id: '8',
      category: 'security',
      question: 'Tôi có thể xóa dữ liệu cá nhân không?',
      answer: 'Có, bạn có thể xóa từng cuộc trò chuyện, nhật ký tâm trạng hoặc toàn bộ tài khoản trong phần Cài đặt > Quyền riêng tư.',
    },
    {
      id: '9',
      category: 'chat',
      question: 'Tôi có thể lưu cuộc trò chuyện không?',
      answer: 'Có, tất cả cuộc trò chuyện được tự động lưu và bạn có thể xem lại trong phần "Lịch sử trò chuyện".',
    },
    {
      id: '10',
      category: 'account',
      question: 'Làm sao để cập nhật thông tin cá nhân?',
      answer: 'Vào Menu > Thông tin cá nhân, nhấn biểu tượng bút chì để chỉnh sửa tên, số điện thoại, ngày sinh và các thông tin khác.',
    },
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContactSupport = (method: string) => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@serochat.com');
        break;
      case 'phone':
        Linking.openURL('tel:+84123456789');
        break;
      case 'website':
        Linking.openURL('https://serochat.com/support');
        break;
    }
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      Alert.alert(
        'Cảm ơn bạn!',
        'Phản hồi của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và cải thiện dịch vụ.',
        [{ text: 'OK', onPress: () => setFeedbackText('') }]
      );
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? colors.card : '#E5E7EB' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trợ giúp & Hỗ trợ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Liên hệ hỗ trợ</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
              onPress={() => handleContactSupport('email')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                <MaterialCommunityIcons name="email" size={28} color="#3B82F6" />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Email</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>support@serochat.com</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
              onPress={() => handleContactSupport('phone')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#0F3A2E' : '#F0FDF4' }]}>
                <MaterialCommunityIcons name="phone" size={28} color="#10B981" />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Hotline</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>0123 456 789</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
              onPress={() => handleContactSupport('website')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#3F2A0A' : '#FEF3C7' }]}>
                <MaterialCommunityIcons name="web" size={28} color="#F59E0B" />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Website</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>serochat.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Categories */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Câu hỏi thường gặp</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' },
                  selectedCategory === category.id && [styles.categoryChipActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <MaterialCommunityIcons
                  name={category.icon as any}
                  size={18}
                  color={selectedCategory === category.id ? '#fff' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: colors.textSecondary },
                    selectedCategory === category.id && styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ List */}
          <View style={styles.faqList}>
            {filteredFaqs.map((faq) => (
              <View key={faq.id} style={[styles.faqItem, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(faq.id)}
                >
                  <MaterialCommunityIcons
                    name="help-circle"
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={[styles.faqQuestionText, { color: colors.text }]}>{faq.question}</Text>
                  <MaterialCommunityIcons
                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {expandedFaq === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Feedback Form */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gửi phản hồi</Text>
          <View style={[styles.feedbackCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
            <Text style={[styles.feedbackLabel, { color: colors.text }]}>
              Bạn có góp ý hoặc câu hỏi khác?
            </Text>
            <TextInput
              style={[styles.feedbackInput, { backgroundColor: isDarkMode ? '#111827' : '#fff', borderColor: isDarkMode ? '#4B5563' : '#D1D5DB', color: colors.text }]}
              placeholder="Nhập nội dung phản hồi của bạn..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmitFeedback}
            >
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Gửi phản hồi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Resources */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tài nguyên khác</Text>
          <TouchableOpacity 
            style={[styles.resourceItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
            onPress={() => navigation.navigate('About')}
          >
            <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />
            <Text style={[styles.resourceText, { color: colors.text }]}>Về Sero Chat</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.resourceItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
            <MaterialCommunityIcons name="file-document" size={24} color="#10B981" />
            <Text style={[styles.resourceText, { color: colors.text }]}>Điều khoản sử dụng</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.resourceItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#F59E0B" />
            <Text style={[styles.resourceText, { color: colors.text }]}>Chính sách bảo mật</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.resourceItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
            <MaterialCommunityIcons name="youtube" size={24} color="#EF4444" />
            <Text style={[styles.resourceText, { color: colors.text }]}>Video hướng dẫn</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  faqList: {
    paddingHorizontal: 16,
  },
  faqItem: {
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    paddingLeft: 34,
  },
  feedbackCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  feedbackLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
  },
  feedbackInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  resourceText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
});

export default HelpSupportScreen;
