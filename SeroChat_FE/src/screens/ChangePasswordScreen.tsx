import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';

const ChangePasswordScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async () => {
    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải khác mật khẩu cũ');
      return;
    }

    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await profileService.changePassword(
        parseInt(user.id),
        formData.oldPassword,
        formData.newPassword
      );

      if (response.success) {
        Alert.alert(
          'Thành công',
          'Đổi mật khẩu thành công',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể đổi mật khẩu';
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information" size={24} color="#F59E0B" />
          <Text style={styles.infoText}>
            Mật khẩu mới phải có ít nhất 6 ký tự và khác mật khẩu cũ
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Mật khẩu hiện tại */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mật khẩu hiện tại</Text>
            <View style={styles.passwordInput}>
              <MaterialCommunityIcons name="lock" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                value={formData.oldPassword}
                onChangeText={(text) => setFormData({ ...formData, oldPassword: text })}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showOldPassword}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                <MaterialCommunityIcons
                  name={showOldPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mật khẩu mới */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mật khẩu mới</Text>
            <View style={styles.passwordInput}>
              <MaterialCommunityIcons name="lock-plus" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                value={formData.newPassword}
                onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showNewPassword}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <MaterialCommunityIcons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {formData.newPassword.length > 0 && formData.newPassword.length < 6 && (
              <Text style={styles.errorText}>Mật khẩu phải có ít nhất 6 ký tự</Text>
            )}
          </View>

          {/* Xác nhận mật khẩu mới */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordInput}>
              <MaterialCommunityIcons name="lock-check" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialCommunityIcons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {formData.confirmPassword.length > 0 &&
              formData.newPassword !== formData.confirmPassword && (
                <Text style={styles.errorText}>Mật khẩu xác nhận không khớp</Text>
              )}
          </View>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
          <View style={styles.requirementItem}>
            <MaterialCommunityIcons
              name={formData.newPassword.length >= 6 ? 'check-circle' : 'circle-outline'}
              size={18}
              color={formData.newPassword.length >= 6 ? '#10B981' : '#999'}
            />
            <Text style={styles.requirementText}>Ít nhất 6 ký tự</Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialCommunityIcons
              name={
                formData.newPassword &&
                formData.oldPassword &&
                formData.newPassword !== formData.oldPassword
                  ? 'check-circle'
                  : 'circle-outline'
              }
              size={18}
              color={
                formData.newPassword &&
                formData.oldPassword &&
                formData.newPassword !== formData.oldPassword
                  ? '#10B981'
                  : '#999'
              }
            />
            <Text style={styles.requirementText}>Khác mật khẩu cũ</Text>
          </View>
          <View style={styles.requirementItem}>
            <MaterialCommunityIcons
              name={
                formData.confirmPassword &&
                formData.newPassword === formData.confirmPassword
                  ? 'check-circle'
                  : 'circle-outline'
              }
              size={18}
              color={
                formData.confirmPassword &&
                formData.newPassword === formData.confirmPassword
                  ? '#10B981'
                  : '#999'
              }
            />
            <Text style={styles.requirementText}>Xác nhận mật khẩu khớp</Text>
          </View>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          style={[
            styles.changeButton,
            loading && styles.changeButtonDisabled,
          ]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="lock-reset" size={20} color="#fff" />
              <Text style={styles.changeButtonText}>Đổi mật khẩu</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Warning */}
        <View style={styles.warningSection}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#EF4444" />
          <Text style={styles.warningText}>
            Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại bằng mật khẩu mới
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  requirementsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#666',
  },
  changeButton: {
    flexDirection: 'row',
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  warningSection: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
});

export default ChangePasswordScreen;
