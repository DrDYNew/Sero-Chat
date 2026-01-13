import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { RegisterRequest } from '../types/auth.types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function RegisterScreen({ navigation }: any) {
  const { login: setAuthLogin } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }

    if (!email) {
      setError('Vui lòng nhập email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ (10 chữ số)');
      return false;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    // Kiểm tra mật khẩu mạnh
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasNumber) {
      setError('Mật khẩu phải có ít nhất 1 chữ hoa và 1 số');
      return false;
    }

    if (!confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const registerData: RegisterRequest = {
        email: email.trim(),
        password: password,
        confirmPassword: confirmPassword,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      };

      const response = await authService.register(registerData);

      if (response.success && response.data?.token) {
        // Cập nhật AuthContext
        setAuthLogin({
          id: response.data.userId.toString(),
          email: response.data.email,
          fullName: response.data.fullName,
          username: response.data.fullName,
        });

        Alert.alert(
          '✅ Đăng ký thành công!',
          'Chúng tôi đã gửi email xác thực đến ' + email + '. Vui lòng kiểm tra hộp thư và click vào link để kích hoạt tài khoản.\n\nBạn vẫn có thể sử dụng ứng dụng ngay bây giờ!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Chuyển về màn hình chính hoặc home
                navigation.replace('Home');
              },
            },
          ]
        );
      } else {
        const errorMsg = response.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        setError(errorMsg);
        Alert.alert('❌ Đăng ký thất bại', errorMsg);
      }
    } catch (err: any) {
      console.error('Register error:', err);
      const errorMsg = err.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.';
      setError(errorMsg);
      Alert.alert('❌ Lỗi kết nối', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={0}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.logoText}>Tạo tài khoản mới</Text>
            <Text style={styles.logoSubtext}>Bắt đầu hành trình chăm sóc sức khỏe tâm lý</Text>
          </View>
        </LinearGradient>

        {/* Register Form */}
        <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
          {/* Error Message */}
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#3F1C1C' : '#fee2e2' }]}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#dc2626" />
              <Text style={[styles.errorText, { color: isDarkMode ? '#FCA5A5' : '#dc2626' }]}>{error}</Text>
            </View>
          ) : null}

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Họ và tên <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#1F2937' : '#f9fafb', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <MaterialCommunityIcons
                name="account-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập họ và tên của bạn"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setError('');
                }}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#1F2937' : '#f9fafb', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="example@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Số điện thoại (không bắt buộc)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#1F2937' : '#f9fafb', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="0987654321"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setError('');
                }}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Mật khẩu <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#1F2937' : '#f9fafb', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ít nhất 6 ký tự, có chữ hoa và số"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              💡 Mật khẩu mạnh: ít nhất 6 ký tự, có chữ hoa, số
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Xác nhận mật khẩu <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#1F2937' : '#f9fafb', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}>
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeTerms(!agreeTerms)}
            disabled={loading}
          >
            <View style={[styles.checkbox, { borderColor: isDarkMode ? '#4B5563' : '#d1d5db' }, agreeTerms && [styles.checkboxChecked, { backgroundColor: colors.primary, borderColor: colors.primary }]]}>
              {agreeTerms && (
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
              Tôi đồng ý với{' '}
              <Text style={[styles.link, { color: colors.primary }]}>Điều khoản sử dụng</Text> và{' '}
              <Text style={[styles.link, { color: colors.primary }]}>Chính sách bảo mật</Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
                  <Text style={styles.registerButtonText}>Đăng ký</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>hoặc</Text>
            <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }]} />
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: colors.card, borderColor: isDarkMode ? '#374151' : '#e5e7eb' }]}
            onPress={() => Alert.alert('Thông báo', 'Đăng ký Google đang được phát triển')}
            disabled={loading}
          >
            <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>Đăng ký bằng Google</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: isDarkMode ? '#1E3A5F' : '#eff6ff', borderLeftColor: colors.primary }]}>
            <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: isDarkMode ? '#93C5FD' : '#1e40af' }]}>
              Sau khi đăng ký, bạn sẽ nhận được email xác thực. Vui lòng kiểm tra hộp thư để kích
              hoạt tài khoản.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  logoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    padding: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  link: {
    color: '#667eea',
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 24,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
});
