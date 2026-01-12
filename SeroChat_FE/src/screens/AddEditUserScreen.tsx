import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';

export default function AddEditUserScreen({ route, navigation }: any) {
  const { userId, mode } = route.params || { mode: 'add' };
  const isEditMode = mode === 'edit';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (isEditMode && userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserDetail(userId);
      if (response.success && response.data) {
        const user = response.data;
        setFormData({
          email: user.email || '',
          fullName: user.fullName || '',
          phoneNumber: user.phoneNumber || '',
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        });
      }
    } catch (error) {
      console.error('Load user error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.fullName) {
      Alert.alert('Lỗi', 'Họ tên là bắt buộc');
      return;
    }

    if (!isEditMode && !formData.email) {
      Alert.alert('Lỗi', 'Email là bắt buộc khi tạo người dùng mới');
      return;
    }

    try {
      setSaving(true);
      const userData = isEditMode
        ? {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber || null,
            gender: formData.gender || null,
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          }
        : {
            email: formData.email,
            fullName: formData.fullName,
          };

      const response = isEditMode
        ? await adminService.updateUser(userId, userData)
        : await adminService.createUser(userData);

      if (response.success) {
        Alert.alert(
          'Thành công',
          isEditMode ? 'Cập nhật người dùng thành công' : 'Tạo người dùng thành công',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể lưu người dùng');
      }
    } catch (error) {
      console.error('Save user error:', error);
      Alert.alert('Lỗi', 'Không thể lưu người dùng');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>{isEditMode ? 'Thông tin cá nhân' : 'Thông tin tài khoản'}</Text>

          {!isEditMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <Text style={styles.hint}>Mật khẩu sẽ được tự động tạo và gửi về email này</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Họ và tên <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChangeText={(value) => updateField('fullName', value)}
              />
            </View>
          </View>

          {isEditMode && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="phone" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="0123456789"
                    value={formData.phoneNumber}
                    onChangeText={(value) => updateField('phoneNumber', value)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.rowGroup}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Giới tính</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="gender-male-female" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nam/Nữ"
                      value={formData.gender}
                      onChangeText={(value) => updateField('gender', value)}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Ngày sinh</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="calendar" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={formData.dateOfBirth}
                      onChangeText={(value) => updateField('dateOfBirth', value)}
                    />
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>{isEditMode ? 'Cập nhật' : 'Tạo mới'}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 10, paddingBottom: 15, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  rowGroup: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1f2937' },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  selectGroup: { marginBottom: 16 },
  selectRow: { flexDirection: 'row', gap: 12 },
  selectOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#f9fafb', borderWidth: 2, borderColor: '#e5e7eb' },
  selectOptionActive: { backgroundColor: '#eff6ff', borderColor: '#667eea' },
  selectText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  selectTextActive: { color: '#1f2937' },
  switchGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchText: { fontSize: 15, fontWeight: '500', color: '#374151' },
  saveButton: { backgroundColor: '#667eea', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16, borderRadius: 12, marginTop: 16, shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
