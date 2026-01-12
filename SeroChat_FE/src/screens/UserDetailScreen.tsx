import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';

interface UserDetail {
  userId: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  role: string;
  subscriptionStatus: string;
  premiumExpiry?: string;
  status: string;
  isVerify: boolean;
  createdAt: string;
  authProvider?: string;
  language?: string;
  theme?: string;
}

export default function UserDetailScreen({ route, navigation }: any) {
  const { userId } = route.params;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserDetail(userId);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải thông tin người dùng');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Load user detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa';
    
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${action} tài khoản "${user.fullName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: newStatus === 'ACTIVE' ? 'default' : 'destructive',
          onPress: async () => {
            const response = await adminService.updateUserStatus(userId, newStatus);
            if (response.success) {
              setUser({ ...user, status: newStatus });
              Alert.alert('Thành công', `Đã ${action} tài khoản thành công`);
            } else {
              Alert.alert('Lỗi', response.message || 'Không thể cập nhật trạng thái');
            }
          },
        },
      ]
    );
  };

  const handleVerifyEmail = async () => {
    if (!user) return;
    
    Alert.alert(
      'Xác nhận',
      `Xác thực email cho "${user.email}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            const response = await adminService.verifyUserEmail(userId);
            if (response.success) {
              setUser({ ...user, isVerify: true });
              Alert.alert('Thành công', 'Đã xác thực email thành công');
            } else {
              Alert.alert('Lỗi', response.message || 'Không thể xác thực email');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? '#10b981' : '#ef4444';
  };

  const getSubscriptionColor = (sub: string) => {
    return sub === 'PREMIUM' ? '#ec4899' : '#6b7280';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết người dùng</Text>
            <View style={{ width: 44 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết</Text>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => navigation.navigate('AddEditUser', { userId: user.userId, mode: 'edit' })}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatarUrl || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            {!user.isVerify && (
              <View style={styles.unverifiedBadge}>
                <MaterialCommunityIcons name="alert-circle" size={14} color="#fff" />
              </View>
            )}
            {user.role === 'ADMIN' && (
              <View style={styles.adminBadge}>
                <MaterialCommunityIcons name="shield-crown" size={18} color="#f59e0b" />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.statusBadges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) + '20', borderColor: getStatusColor(user.status) }]}>
              <MaterialCommunityIcons name={user.status === 'ACTIVE' ? 'check-circle' : 'close-circle'} size={16} color={getStatusColor(user.status)} />
              <Text style={[styles.statusBadgeText, { color: getStatusColor(user.status) }]}>{user.status}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getSubscriptionColor(user.subscriptionStatus) + '20', borderColor: getSubscriptionColor(user.subscriptionStatus) }]}>
              <MaterialCommunityIcons name={user.subscriptionStatus === 'PREMIUM' ? 'crown' : 'account'} size={16} color={getSubscriptionColor(user.subscriptionStatus)} />
              <Text style={[styles.statusBadgeText, { color: getSubscriptionColor(user.subscriptionStatus) }]}>{user.subscriptionStatus}</Text>
            </View>
          </View>
        </View>

        {/* Information Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="phone" label="Số điện thoại" value={user.phoneNumber || 'Chưa có'} />
            <InfoRow icon="gender-male-female" label="Giới tính" value={user.gender || 'Chưa có'} />
            <InfoRow icon="cake" label="Ngày sinh" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa có'} />
            <InfoRow icon="translate" label="Ngôn ngữ" value={user.language || 'Chưa có'} />
            <InfoRow icon="theme-light-dark" label="Giao diện" value={user.theme || 'Chưa có'} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="shield-account" label="Vai trò" value={user.role} />
            <InfoRow icon="login" label="Phương thức đăng nhập" value={user.authProvider || 'Email'} />
            <InfoRow icon="email-check" label="Xác thực email" value={user.isVerify ? 'Đã xác thực' : 'Chưa xác thực'} color={user.isVerify ? '#10b981' : '#ef4444'} />
            <InfoRow icon="calendar-check" label="Ngày tham gia" value={new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })} />
            {user.subscriptionStatus === 'PREMIUM' && user.premiumExpiry && (
              <InfoRow icon="calendar-clock" label="Premium hết hạn" value={new Date(user.premiumExpiry).toLocaleDateString('vi-VN')} />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động</Text>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: user.status === 'ACTIVE' ? '#ef444420' : '#10b98120' }]} onPress={handleToggleStatus}>
            <MaterialCommunityIcons name={user.status === 'ACTIVE' ? 'lock' : 'lock-open'} size={24} color={user.status === 'ACTIVE' ? '#ef4444' : '#10b981'} />
            <View style={styles.actionButtonText}>
              <Text style={[styles.actionButtonTitle, { color: user.status === 'ACTIVE' ? '#ef4444' : '#10b981' }]}>
                {user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
              </Text>
              <Text style={styles.actionButtonSubtitle}>
                {user.status === 'ACTIVE' ? 'Người dùng sẽ không thể đăng nhập' : 'Người dùng có thể đăng nhập lại'}
              </Text>
            </View>
          </TouchableOpacity>

          {!user.isVerify && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3b82f620' }]} onPress={handleVerifyEmail}>
              <MaterialCommunityIcons name="email-check" size={24} color="#3b82f6" />
              <View style={styles.actionButtonText}>
                <Text style={[styles.actionButtonTitle, { color: '#3b82f6' }]}>Xác thực email</Text>
                <Text style={styles.actionButtonSubtitle}>Xác thực email cho người dùng</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f59e0b20' }]} onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}>
            <MaterialCommunityIcons name="crown" size={24} color="#f59e0b" />
            <View style={styles.actionButtonText}>
              <Text style={[styles.actionButtonTitle, { color: '#f59e0b' }]}>Nâng cấp Premium</Text>
              <Text style={styles.actionButtonSubtitle}>Cấp quyền Premium cho người dùng</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabel}>
      <MaterialCommunityIcons name={icon as any} size={20} color="#9ca3af" />
      <Text style={styles.infoLabelText}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, color && { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 10, paddingBottom: 15, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  editButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  profileCard: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: -20, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#e5e7eb' },
  unverifiedBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#f59e0b', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  adminBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#fff', borderRadius: 14, padding: 4, borderWidth: 2, borderColor: '#f59e0b' },
  userName: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 2, textAlign: 'center' },
  userEmail: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  statusBadges: { flexDirection: 'row', gap: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  statusBadgeText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  section: { marginHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  infoLabelText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#1f2937', fontWeight: '600', flex: 1, textAlign: 'right' },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  actionButtonText: { marginLeft: 12, flex: 1 },
  actionButtonTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  actionButtonSubtitle: { fontSize: 13, color: '#6b7280' },
});
