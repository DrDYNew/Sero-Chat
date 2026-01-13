import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PrivacyOption {
  id: string;
  title: string;
  description: string;
  value: string;
  options: { label: string; value: string; icon: string }[];
}

const PrivacySettingsScreen = ({ navigation }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<PrivacyOption | null>(null);

  // Toggle switches state
  const [activeStatus, setActiveStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  // Privacy settings với fake data
  const [privacySettings, setPrivacySettings] = useState<PrivacyOption[]>([
    {
      id: 'profile_visibility',
      title: 'Ai có thể xem trang cá nhân của bạn',
      description: 'Kiểm soát ai có thể xem thông tin cá nhân',
      value: 'public',
      options: [
        { label: 'Công khai', value: 'public', icon: 'earth' },
        { label: 'Bạn bè', value: 'friends', icon: 'account-group' },
        { label: 'Chỉ mình tôi', value: 'private', icon: 'lock' },
      ],
    },
    {
      id: 'saved_blogs',
      title: 'Ai có thể xem bài viết đã lưu',
      description: 'Kiểm soát quyền truy cập vào bài viết đã lưu',
      value: 'private',
      options: [
        { label: 'Công khai', value: 'public', icon: 'earth' },
        { label: 'Bạn bè', value: 'friends', icon: 'account-group' },
        { label: 'Chỉ mình tôi', value: 'private', icon: 'lock' },
      ],
    },
    {
      id: 'mood_logs',
      title: 'Ai có thể xem nhật ký tâm trạng',
      description: 'Kiểm soát quyền riêng tư của nhật ký tâm trạng',
      value: 'private',
      options: [
        { label: 'Công khai', value: 'public', icon: 'earth' },
        { label: 'Bạn bè', value: 'friends', icon: 'account-group' },
        { label: 'Chỉ mình tôi', value: 'private', icon: 'lock' },
      ],
    },
    {
      id: 'activity',
      title: 'Ai có thể xem hoạt động của bạn',
      description: 'Lịch sử đọc, tương tác với bài viết',
      value: 'friends',
      options: [
        { label: 'Công khai', value: 'public', icon: 'earth' },
        { label: 'Bạn bè', value: 'friends', icon: 'account-group' },
        { label: 'Chỉ mình tôi', value: 'private', icon: 'lock' },
      ],
    },
    {
      id: 'contact',
      title: 'Ai có thể liên hệ với bạn',
      description: 'Kiểm soát ai có thể gửi tin nhắn hoặc thêm bạn bè',
      value: 'public',
      options: [
        { label: 'Mọi người', value: 'public', icon: 'earth' },
        { label: 'Bạn bè của bạn bè', value: 'friends_of_friends', icon: 'account-multiple' },
        { label: 'Không ai', value: 'none', icon: 'cancel' },
      ],
    },
    {
      id: 'search',
      title: 'Ai có thể tìm kiếm bạn',
      description: 'Kiểm soát khả năng hiển thị trong tìm kiếm',
      value: 'public',
      options: [
        { label: 'Mọi người', value: 'public', icon: 'earth' },
        { label: 'Bạn bè', value: 'friends', icon: 'account-group' },
        { label: 'Không ai', value: 'none', icon: 'cancel' },
      ],
    },
  ]);

  const openModal = (setting: PrivacyOption) => {
    setSelectedSetting(setting);
    setModalVisible(true);
  };

  const handleSelectOption = (value: string) => {
    if (!selectedSetting) return;

    setPrivacySettings((prev) =>
      prev.map((setting) =>
        setting.id === selectedSetting.id ? { ...setting, value } : setting
      )
    );
    setModalVisible(false);
  };

  const getSelectedOption = (setting: PrivacyOption) => {
    return setting.options.find((opt) => opt.value === setting.value);
  };

  const getIconColor = (value: string) => {
    switch (value) {
      case 'public':
        return '#10B981';
      case 'friends':
      case 'friends_of_friends':
        return '#3B82F6';
      case 'private':
      case 'none':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quyền riêng tư</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#3B82F6" />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>Bảo vệ quyền riêng tư của bạn</Text>
            <Text style={styles.infoBannerDescription}>
              Kiểm soát ai có thể xem thông tin và hoạt động của bạn
            </Text>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt quyền riêng tư</Text>
          {privacySettings.map((setting) => {
            const selectedOption = getSelectedOption(setting);
            return (
              <TouchableOpacity
                key={setting.id}
                style={styles.settingItem}
                onPress={() => openModal(setting)}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                  {selectedOption && (
                    <View style={styles.selectedOption}>
                      <MaterialCommunityIcons
                        name={selectedOption.icon as any}
                        size={16}
                        color={getIconColor(setting.value)}
                      />
                      <Text
                        style={[
                          styles.selectedOptionText,
                          { color: getIconColor(setting.value) },
                        ]}
                      >
                        {selectedOption.label}
                      </Text>
                    </View>
                  )}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Activity Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt hoạt động</Text>

          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Hiển thị trạng thái hoạt động</Text>
              <Text style={styles.toggleDescription}>
                Cho phép người khác thấy khi bạn đang online
              </Text>
            </View>
            <Switch
              value={activeStatus}
              onValueChange={setActiveStatus}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={activeStatus ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Xác nhận đã đọc</Text>
              <Text style={styles.toggleDescription}>
                Thông báo khi bạn đã đọc tin nhắn
              </Text>
            </View>
            <Switch
              value={readReceipts}
              onValueChange={setReadReceipts}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={readReceipts ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Chia sẻ vị trí</Text>
              <Text style={styles.toggleDescription}>
                Cho phép ứng dụng truy cập vị trí của bạn
              </Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={locationSharing ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dữ liệu & Quyền riêng tư</Text>

          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Thu thập dữ liệu</Text>
              <Text style={styles.toggleDescription}>
                Cho phép thu thập dữ liệu để cải thiện trải nghiệm
              </Text>
            </View>
            <Switch
              value={dataCollection}
              onValueChange={setDataCollection}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={dataCollection ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Cá nhân hóa nội dung</Text>
              <Text style={styles.toggleDescription}>
                Sử dụng dữ liệu để đề xuất nội dung phù hợp
              </Text>
            </View>
            <Switch
              value={personalization}
              onValueChange={setPersonalization}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={personalization ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <TouchableOpacity style={styles.linkItem}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#3B82F6" />
            <Text style={styles.linkText}>Xem chính sách quyền riêng tư</Text>
            <MaterialCommunityIcons name="open-in-new" size={18} color="#3B82F6" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <MaterialCommunityIcons name="download" size={20} color="#3B82F6" />
            <Text style={styles.linkText}>Tải xuống dữ liệu của bạn</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
            <Text style={[styles.linkText, { color: '#EF4444' }]}>Xóa tài khoản</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSetting?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>{selectedSetting?.description}</Text>

            {selectedSetting?.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedSetting.value === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => handleSelectOption(option.value)}
              >
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={24}
                  color={
                    selectedSetting.value === option.value
                      ? '#3B82F6'
                      : '#6B7280'
                  }
                />
                <View style={styles.modalOptionText}>
                  <Text
                    style={[
                      styles.modalOptionLabel,
                      selectedSetting.value === option.value &&
                        styles.modalOptionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                {selectedSetting.value === option.value && (
                  <MaterialCommunityIcons name="check-circle" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoBannerDescription: {
    fontSize: 14,
    color: '#3B82F6',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  selectedOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  modalOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  modalOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  modalOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  modalOptionLabelSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
});

export default PrivacySettingsScreen;
