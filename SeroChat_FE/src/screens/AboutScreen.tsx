import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const AboutScreen = ({ navigation }: any) => {
  const { colors, isDarkMode } = useTheme();
  
  const teamMembers = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      role: 'CEO & Founder',
      avatar: 'account-circle',
      color: '#3B82F6',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      role: 'Lead Psychologist',
      avatar: 'account-circle',
      color: '#EC4899',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      role: 'Tech Lead',
      avatar: 'account-circle',
      color: '#10B981',
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      role: 'Product Manager',
      avatar: 'account-circle',
      color: '#F59E0B',
    },
  ];

  const features = [
    {
      icon: 'robot',
      title: 'AI Chatbot thông minh',
      description: 'Trò chuyện với AI được huấn luyện bởi chuyên gia tâm lý',
      color: '#8B5CF6',
    },
    {
      icon: 'book-open-variant',
      title: 'Thư viện Blog phong phú',
      description: 'Kiến thức sức khỏe tâm thần từ các chuyên gia',
      color: '#EC4899',
    },
    {
      icon: 'emoticon-happy',
      title: 'Nhật ký tâm trạng',
      description: 'Ghi lại và theo dõi cảm xúc hàng ngày',
      color: '#3B82F6',
    },
    {
      icon: 'meditation',
      title: 'Thư giãn & Thiền định',
      description: 'Âm thanh thiên nhiên và bài tập thở',
      color: '#10B981',
    },
    {
      icon: 'doctor',
      title: 'Kết nối chuyên gia',
      description: 'Tìm bác sĩ tâm lý phù hợp với bạn',
      color: '#F59E0B',
    },
    {
      icon: 'shield-check',
      title: 'Bảo mật tuyệt đối',
      description: 'Dữ liệu được mã hóa end-to-end',
      color: '#6366F1',
    },
  ];

  const stats = [
    { label: 'Người dùng', value: '100K+', icon: 'account-group' },
    { label: 'Cuộc trò chuyện', value: '5M+', icon: 'message' },
    { label: 'Bài viết', value: '1000+', icon: 'book' },
    { label: 'Chuyên gia', value: '50+', icon: 'doctor' },
  ];

  const handleSocialLink = (platform: string) => {
    const urls: { [key: string]: string } = {
      facebook: 'https://facebook.com/serochat',
      instagram: 'https://instagram.com/serochat',
      twitter: 'https://twitter.com/serochat',
      youtube: 'https://youtube.com/@serochat',
    };
    Linking.openURL(urls[platform]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? colors.card : '#E5E7EB' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Về Sero Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo & Brand */}
        <View style={[styles.brandSection, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? colors.card : '#E5E7EB' }]}>
          <View style={[styles.logoContainer, { backgroundColor: isDarkMode ? '#3F2A6B' : '#F3E8FF' }]}>
            <MaterialCommunityIcons name="chat-processing" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.brandName, { color: colors.primary }]}>Sero Chat</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Người bạn đồng hành sức khỏe tâm thần</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Phiên bản 1.0.0</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <MaterialCommunityIcons name={stat.icon as any} size={28} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Mission */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sứ mệnh của chúng tôi</Text>
          </View>
          <Text style={[styles.missionText, { color: colors.textSecondary }]}>
            Sero Chat được tạo ra với mục tiêu mang đến sự hỗ trợ tâm lý dễ tiếp cận, 
            an toàn và hiệu quả cho mọi người. Chúng tôi tin rằng sức khỏe tâm thần 
            là quyền cơ bản của mỗi con người và mọi người đều xứng đáng được lắng nghe, 
            thấu hiểu và hỗ trợ.
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star" size={24} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tính năng nổi bật</Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <MaterialCommunityIcons 
                    name={feature.icon as any} 
                    size={32} 
                    color={feature.color} 
                  />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-group" size={24} color="#3B82F6" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Đội ngũ sáng lập</Text>
          </View>
          <View style={styles.teamGrid}>
            {teamMembers.map((member) => (
              <View key={member.id} style={[styles.teamCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                <View style={[styles.teamAvatar, { backgroundColor: `${member.color}15` }]}>
                  <MaterialCommunityIcons 
                    name={member.avatar as any} 
                    size={48} 
                    color={member.color} 
                  />
                </View>
                <Text style={[styles.teamName, { color: colors.text }]}>{member.name}</Text>
                <Text style={[styles.teamRole, { color: colors.textSecondary }]}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Media */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="share-variant" size={24} color="#EC4899" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Kết nối với chúng tôi</Text>
          </View>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
              onPress={() => handleSocialLink('facebook')}
            >
              <MaterialCommunityIcons name="facebook" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
              onPress={() => handleSocialLink('instagram')}
            >
              <MaterialCommunityIcons name="instagram" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => handleSocialLink('twitter')}
            >
              <MaterialCommunityIcons name="twitter" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#FF0000' }]}
              onPress={() => handleSocialLink('youtube')}
            >
              <MaterialCommunityIcons name="youtube" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact & Legal */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information" size={24} color="#6B7280" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin liên hệ</Text>
          </View>
          
          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons name="email" size={20} color="#3B82F6" />
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>contact@serochat.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons name="phone" size={20} color="#10B981" />
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>+84 123 456 789</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#EF4444" />
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              123 Nguyễn Huệ, Quận 1, TP.HCM, Việt Nam
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />

          <TouchableOpacity style={styles.legalItem}>
            <Text style={[styles.legalText, { color: colors.textSecondary }]}>Điều khoản sử dụng</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem}>
            <Text style={[styles.legalText, { color: colors.textSecondary }]}>Chính sách bảo mật</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem}>
            <Text style={[styles.legalText, { color: colors.textSecondary }]}>Giấy phép hoạt động</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2026 Sero Chat. All rights reserved.
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
            Made with ❤️ in Vietnam
          </Text>
        </View>
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
  brandSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  missionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
    textAlign: 'justify',
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  teamCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  teamRole: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  legalText: {
    fontSize: 15,
    color: '#4B5563',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default AboutScreen;
