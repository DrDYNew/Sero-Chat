import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Hotline {
  id: number;
  name: string;
  organization: string;
  phone: string;
  description: string;
  available: string;
  icon: string;
  color: string;
  category: 'emergency' | 'support' | 'counseling';
}

const EmergencyHotlineScreen = ({ navigation }: any) => {
  const { colors, isDarkMode } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Fake data cho đường dây khẩn cấp
  const hotlines: Hotline[] = [
    {
      id: 1,
      name: 'Đường dây nóng tâm lý quốc gia',
      organization: 'Bộ Y tế Việt Nam',
      phone: '1900-6969',
      description: 'Hỗ trợ tâm lý khẩn cấp miễn phí 24/7. Tư vấn cho người có ý định tự tử, trầm cảm nặng, rối loạn lo âu cấp tính.',
      available: '24/7',
      icon: 'phone-alert',
      color: '#EF4444',
      category: 'emergency',
    },
    {
      id: 2,
      name: 'Tổng đài hỗ trợ sức khỏe tâm thần',
      organization: 'Viện Sức khỏe Tâm thần',
      phone: '1800-1234',
      description: 'Tư vấn và hỗ trợ cho người bị rối loạn tâm thần, trầm cảm, lo âu. Hướng dẫn tìm kiếm dịch vụ y tế chuyên khoa.',
      available: '8:00 - 22:00 hàng ngày',
      icon: 'hospital-box',
      color: '#F59E0B',
      category: 'support',
    },
    {
      id: 3,
      name: 'Đường dây tư vấn tâm lý học sinh',
      organization: 'Hội Tâm lý Giáo dục Việt Nam',
      phone: '1800-1567',
      description: 'Hỗ trợ tư vấn tâm lý cho học sinh, sinh viên. Giải quyết vấn đề học tập, bạo lực học đường, áp lực kỳ thi.',
      available: '7:00 - 21:00 các ngày trong tuần',
      icon: 'school',
      color: '#8B5CF6',
      category: 'counseling',
    },
    {
      id: 4,
      name: 'Hotline hỗ trợ phụ nữ và trẻ em',
      organization: 'Trung tâm Tư vấn Gia đình',
      phone: '1900-9696',
      description: 'Hỗ trợ tâm lý cho phụ nữ và trẻ em bị bạo lực gia đình, lạm dụng. Tư vấn pháp luật và bảo vệ quyền lợi.',
      available: '24/7',
      icon: 'shield-account',
      color: '#EC4899',
      category: 'emergency',
    },
    {
      id: 5,
      name: 'Tổng đài tư vấn nghiện ma túy',
      organization: 'Trung tâm Phòng chống Ma túy',
      phone: '1800-6789',
      description: 'Tư vấn và hỗ trợ người nghiện ma túy, gia đình người nghiện. Hướng dẫn điều trị cai nghiện.',
      available: '8:00 - 20:00 hàng ngày',
      icon: 'medication',
      color: '#10B981',
      category: 'support',
    },
    {
      id: 6,
      name: 'Đường dây hỗ trợ người cao tuổi',
      organization: 'Hội Người cao tuổi Việt Nam',
      phone: '1800-5555',
      description: 'Tư vấn sức khỏe tâm thần cho người cao tuổi. Hỗ trợ người già cô đơn, trầm cảm sau mất người thân.',
      available: '6:00 - 22:00 hàng ngày',
      icon: 'human-cane',
      color: '#14B8A6',
      category: 'counseling',
    },
    {
      id: 7,
      name: 'Cấp cứu Tâm thần Hà Nội',
      organization: 'Bệnh viện Tâm thần Hà Nội',
      phone: '024-3825-3937',
      description: 'Cấp cứu các trường hợp tâm thần cấp tính, kích động, có hành vi nguy hiểm.',
      available: '24/7',
      icon: 'ambulance',
      color: '#DC2626',
      category: 'emergency',
    },
    {
      id: 8,
      name: 'Tư vấn tâm lý trực tuyến',
      organization: 'Trung tâm Tư vấn Tâm lý Online',
      phone: '1900-2468',
      description: 'Tư vấn tâm lý qua điện thoại và video call. Hỗ trợ cho mọi lứa tuổi với các vấn đề tâm lý thường gặp.',
      available: '7:00 - 23:00 hàng ngày',
      icon: 'video-account',
      color: '#3B82F6',
      category: 'counseling',
    },
  ];

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có muốn gọi đến ${name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gọi ngay',
          onPress: () => Linking.openURL(`tel:${phone}`),
        },
      ]
    );
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'emergency':
        return { label: 'Khẩn cấp', color: '#DC2626' };
      case 'support':
        return { label: 'Hỗ trợ', color: '#F59E0B' };
      case 'counseling':
        return { label: 'Tư vấn', color: '#3B82F6' };
      default:
        return { label: 'Khác', color: '#6B7280' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? '#334155' : '#e0e0e0' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Đường dây khẩn cấp</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Alert Banner */}
      <View style={[styles.alertBanner, { backgroundColor: isDarkMode ? '#7F1D1D' : '#FEE2E2' }]}>
        <MaterialCommunityIcons name="alert-circle" size={24} color="#DC2626" />
        <View style={styles.alertTextContainer}>
          <Text style={[styles.alertTitle, { color: isDarkMode ? '#FCA5A5' : '#DC2626' }]}>Trong trường hợp khẩn cấp</Text>
          <Text style={[styles.alertText, { color: isDarkMode ? '#FCA5A5' : '#991B1B' }]}>
            Nếu bạn hoặc ai đó đang gặp nguy hiểm, vui lòng gọi ngay 115 hoặc đến bệnh viện gần nhất
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Các đường dây hỗ trợ tâm lý 24/7
        </Text>

        {hotlines.map((hotline) => {
          const isExpanded = expandedId === hotline.id;
          const categoryInfo = getCategoryLabel(hotline.category);

          return (
            <View key={hotline.id} style={[styles.hotlineCard, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.hotlineHeader}
                onPress={() => toggleExpand(hotline.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: hotline.color + '20' }]}>
                  <MaterialCommunityIcons
                    name={hotline.icon as any}
                    size={28}
                    color={hotline.color}
                  />
                </View>

                <View style={styles.hotlineInfo}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.hotlineName, { color: colors.text }]} numberOfLines={1}>
                      {hotline.name}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
                      <Text style={styles.categoryText}>{categoryInfo.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.organization, { color: colors.textSecondary }]} numberOfLines={1}>
                    {hotline.organization}
                  </Text>
                  <View style={styles.phoneRow}>
                    <MaterialCommunityIcons name="phone" size={16} color="#14B8A6" />
                    <Text style={styles.phoneNumber}>{hotline.phone}</Text>
                  </View>
                </View>

                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={[styles.expandedContent, { borderTopColor: isDarkMode ? '#334155' : '#E5E7EB' }]}>
                  <View style={styles.descriptionContainer}>
                    <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{hotline.description}</Text>
                  </View>

                  <View style={styles.availabilityRow}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textSecondary} />
                    <Text style={[styles.availabilityText, { color: colors.textSecondary }]}>Thời gian: {hotline.available}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.callButton, { backgroundColor: hotline.color }]}
                    onPress={() => handleCall(hotline.phone, hotline.name)}
                  >
                    <MaterialCommunityIcons name="phone" size={20} color="#fff" />
                    <Text style={styles.callButtonText}>Gọi ngay</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Warning Footer */}
        <View style={[styles.warningFooter, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}>
          <MaterialCommunityIcons name="information" size={20} color={colors.textSecondary} />
          <Text style={[styles.warningText, { color: colors.textSecondary }]}>
            Tất cả các cuộc gọi đều được bảo mật và không tốn phí. Đừng ngần ngại liên hệ khi bạn cần hỗ trợ.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hotlineCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hotlineHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hotlineInfo: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  hotlineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  organization: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14B8A6',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descriptionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: '#666',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningFooter: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default EmergencyHotlineScreen;
