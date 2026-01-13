import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { useTheme } from '../contexts/ThemeContext';

const ProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await profileService.getProfile(parseInt(user.id));
      if (response.success) {
        const profileData = response.data;
        setFormData({
          fullName: profileData.fullName || '',
          phoneNumber: profileData.phoneNumber || '',
          gender: profileData.gender || '',
          dateOfBirth: profileData.dateOfBirth || '',
          avatarUrl: profileData.avatarUrl || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const response = await profileService.updateProfile(parseInt(user.id), formData);
      
      if (response.success) {
        // Cập nhật context
        updateUser({
          ...user,
          fullName: formData.fullName,
          avatarUrl: formData.avatarUrl,
        });
        
        setEditing(false);
        Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setEditing(false);
  };

  const pickImage = async () => {
    try {
      // Xin quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
        return;
      }

      // Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    if (!user?.id) return;

    try {
      setUploadingImage(true);
      const response = await profileService.uploadAvatar(parseInt(user.id), imageUri);
      
      if (response.success) {
        const newAvatarUrl = response.data.avatarUrl;
        
        // Cập nhật local state
        setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
        
        // Cập nhật context
        updateUser({
          ...user,
          avatarUrl: newAvatarUrl,
        });
        
        Alert.alert('Thành công', 'Cập nhật avatar thành công');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể upload avatar');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? colors.card : '#e0e0e0' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Thông tin cá nhân</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? colors.card : '#e0e0e0' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thông tin cá nhân</Text>
        {!editing ? (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <MaterialCommunityIcons name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleCancel}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={[styles.avatarSection, { backgroundColor: colors.card, borderBottomColor: colors.background }]}>
          {uploadingImage ? (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          ) : formData.avatarUrl ? (
            <Image source={{ uri: formData.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {formData.fullName?.charAt(0)?.toUpperCase() || 
                 user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.changeAvatarButton, { backgroundColor: colors.primary }]}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={[styles.formSection, { backgroundColor: colors.card }]}>
          {/* Email (không thể chỉnh sửa) */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Email</Text>
            <View style={[styles.input, styles.disabledInput, { backgroundColor: isDarkMode ? '#1F2937' : '#f0f0f0' }]}>
              <MaterialCommunityIcons name="email" size={20} color={colors.textSecondary} />
              <Text style={[styles.disabledText, { color: colors.textSecondary }]}>{user?.email}</Text>
            </View>
          </View>

          {/* Họ và tên */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Họ và tên</Text>
            <View style={[styles.input, { backgroundColor: isDarkMode ? '#1F2937' : '#f8f9fa' }]}>
              <MaterialCommunityIcons name="account" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                placeholder="Nhập họ và tên"
                editable={editing}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Số điện thoại */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Số điện thoại</Text>
            <View style={[styles.input, { backgroundColor: isDarkMode ? '#1F2937' : '#f8f9fa' }]}>
              <MaterialCommunityIcons name="phone" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                editable={editing}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Giới tính */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Giới tính</Text>
            {editing ? (
              <View style={styles.genderContainer}>
                {['Nam', 'Nữ', 'Khác'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      { backgroundColor: isDarkMode ? '#1F2937' : '#f8f9fa', borderColor: isDarkMode ? '#374151' : '#e0e0e0' },
                      formData.gender === gender && [styles.genderButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                    ]}
                    onPress={() => setFormData({ ...formData, gender })}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        { color: colors.textSecondary },
                        formData.gender === gender && styles.genderTextActive,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.input, { backgroundColor: isDarkMode ? '#1F2937' : '#f8f9fa' }]}>
                <MaterialCommunityIcons name="gender-male-female" size={20} color={colors.textSecondary} />
                <Text style={[styles.displayText, { color: colors.textSecondary }]}>{formData.gender || 'Chưa cập nhật'}</Text>
              </View>
            )}
          </View>

          {/* Ngày sinh */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Ngày sinh</Text>
            <View style={[styles.input, { backgroundColor: isDarkMode ? '#1F2937' : '#f8f9fa' }]}>
              <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                placeholder="YYYY-MM-DD"
                editable={editing}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {editing && (
          <View style={[styles.actionButtons, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: isDarkMode ? '#374151' : '#f0f0f0' }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Additional Options */}
        <View style={[styles.optionsSection, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.optionItem, { borderBottomColor: isDarkMode ? '#374151' : '#f0f0f0' }]}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: isDarkMode ? '#3F2A0A' : '#FEF3C7' }]}>
                <MaterialCommunityIcons name="lock-reset" size={24} color="#F59E0B" />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>Đổi mật khẩu</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 32,
    right: '35%',
    backgroundColor: '#8B5CF6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  disabledText: {
    flex: 1,
    fontSize: 15,
    color: '#999',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  displayText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  genderButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  genderTextActive: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  optionsSection: {
    backgroundColor: '#fff',
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
});

export default ProfileScreen;
