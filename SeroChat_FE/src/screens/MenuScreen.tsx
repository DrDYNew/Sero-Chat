import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { notificationService } from '../services/notificationService';

const MenuScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    conversations: 0,
    savedBlogs: 0,
    moodLogs: 0,
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserStats();
      loadUnreadNotifications();
    }
  }, [isAuthenticated, user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const userStats = await profileService.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.log('Error loading user stats:', error.message);
      // Fallback to zero if API fails
      setStats({
        conversations: 0,
        savedBlogs: 0,
        moodLogs: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const response = await notificationService.getUnreadCount(parseInt(user.id));
      if (response.success) {
        setUnreadNotifications(response.data.unreadCount);
      }
    } catch (error) {
      console.log('Error loading unread notifications:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔴 Starting logout...');
              await logout();
              console.log('🔴 Logout completed');
              
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            } catch (error) {
              console.log('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const renderUserCard = () => {
    if (!isAuthenticated || !user) {
      return (
        <TouchableOpacity 
          style={styles.userCard}
          onPress={() => navigation.navigate('Login')}
        >
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#ccc" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Đăng nhập</Text>
            <Text style={styles.userSubtext}>Để xem thông tin cá nhân</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.userCard}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.userAvatar} />
        ) : (
          <View style={styles.userAvatarPlaceholder}>
            <Text style={styles.userAvatarText}>
              {user.fullName?.charAt(0)?.toUpperCase() || 
               user.username?.charAt(0)?.toUpperCase() || 
               user.email?.charAt(0)?.toUpperCase() || 'S'}
            </Text>
          </View>
        )}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>
            {user.fullName || user.username || 'Người dùng'}
          </Text>
          {user.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}
          {user.phoneNumber && (
            <Text style={styles.userPhone}>📱 {user.phoneNumber}</Text>
          )}
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('NotFound', { featureName: 'Chỉnh sửa hồ sơ' })}
          >
            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStatsCard = () => {
    if (!isAuthenticated) return null;

    return (
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.conversations}</Text>
          <Text style={styles.statLabel}>Cuộc trò chuyện</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.savedBlogs}</Text>
          <Text style={styles.statLabel}>Blog đã lưu</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.moodLogs}</Text>
          <Text style={styles.statLabel}>Nhật ký</Text>
        </View>
      </View>
    );
  };

  const renderSectionTitle = (title) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderMenuItem = (icon, title, subtitle, color, badge, onPress) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: color || '#f0f0f0' }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  const healthFeatures = [
    { 
      icon: 'chat-processing', 
      title: 'Lịch sử trò chuyện', 
      subtitle: 'Xem lại các cuộc trò chuyện với AI',
      color: '#8B5CF6', 
      badge: stats.conversations > 0 ? stats.conversations : null,
      route: 'ConversationHistory'
    },
    { 
      icon: 'emoticon-happy-outline', 
      title: 'Nhật ký tâm trạng', 
      subtitle: 'Theo dõi cảm xúc hàng ngày',
      color: '#10B981', 
      badge: stats.moodLogs > 0 ? stats.moodLogs : null,
      route: 'MoodLog'
    },
    { 
      icon: 'spa', 
      title: 'Thư giãn & Thiền', 
      subtitle: 'Âm thanh và bài tập thư giãn',
      color: '#3B82F6', 
      badge: null,
      route: 'Relaxation'
    },
  ];

  const contentFeatures = [
    { 
      icon: 'book-open-variant', 
      title: 'Blog đã lưu', 
      subtitle: 'Các bài viết bạn quan tâm',
      color: '#EC4899', 
      badge: stats.savedBlogs > 0 ? stats.savedBlogs : null,
      route: 'SavedBlogs'
    },
    { 
      icon: 'history', 
      title: 'Lịch sử đọc', 
      subtitle: 'Blog đã xem gần đây',
      color: '#6366F1', 
      badge: null,
      route: 'ReadHistory'
    },
  ];

  const supportFeatures = [
    { 
      icon: 'doctor', 
      title: 'Tìm chuyên gia', 
      subtitle: 'Kết nối với bác sĩ tâm lý',
      color: '#14B8A6', 
      badge: null,
      route: 'DoctorList'
    },
    { 
      icon: 'phone-alert', 
      title: 'Đường dây khẩn cấp', 
      subtitle: 'Hỗ trợ 24/7 khi cần thiết',
      color: '#EF4444', 
      badge: null,
      route: 'EmergencyHotline'
    },
  ];

  const accountFeatures = [
    { 
      icon: 'crown-outline', 
      title: 'Gói dịch vụ Premium', 
      subtitle: 'Nâng cấp trải nghiệm của bạn',
      color: '#F59E0B', 
      badge: 'Hot',
      route: 'SubscriptionPlans'
    },
    { 
      icon: 'account-edit', 
      title: 'Thông tin cá nhân', 
      subtitle: 'Chỉnh sửa họ tên, email, số điện thoại',
      color: '#6B7280', 
      badge: null,
      route: 'Profile'
    },
    { 
      icon: 'lock-reset', 
      title: 'Đổi mật khẩu', 
      subtitle: 'Bảo mật tài khoản',
      color: '#6B7280', 
      badge: null,
      route: 'ChangePassword'
    },
    { 
      icon: 'shield-check', 
      title: 'Quyền riêng tư', 
      subtitle: 'Quản lý dữ liệu cá nhân',
      color: '#6B7280', 
      badge: null,
      route: 'PrivacySettings'
    },
    { 
      icon: 'bell-outline', 
      title: 'Thông báo', 
      subtitle: 'Cài đặt nhắc nhở và thông báo',
      color: '#6B7280', 
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      route: 'Notification'
    },
    { 
      icon: 'help-circle', 
      title: 'Trợ giúp & Hỗ trợ', 
      subtitle: 'Câu hỏi thường gặp',
      color: '#6B7280', 
      badge: null,
      route: 'HelpSupport'
    },
    { 
      icon: 'information', 
      title: 'Về Sero Chat', 
      subtitle: 'Phiên bản 1.0.0',
      color: '#6B7280', 
      badge: null,
      route: 'About'
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            {renderUserCard()}
            {renderStatsCard()}

            {/* Admin Section */}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <>
                {renderSectionTitle('Quản trị hệ thống')}
                {renderMenuItem(
                  'view-dashboard',
                  'Dashboard Admin',
                  'Quản lý và thống kê hệ thống',
                  '#7C3AED',
                  null,
                  () => navigation.navigate('AdminDashboard')
                )}
              </>
            )}

            {isAuthenticated && (
              <>
                {renderSectionTitle('Sức khỏe tâm lý')}
                {healthFeatures.map((item, index) => (
                  <View key={`health-${index}`}>
                    {renderMenuItem(
                      item.icon,
                      item.title,
                      item.subtitle,
                      item.color,
                      item.badge,
                      () => navigation.navigate(item.route)
                    )}
                  </View>
                ))}

                {renderSectionTitle('Nội dung')}
                {contentFeatures.map((item, index) => (
                  <View key={`content-${index}`}>
                    {renderMenuItem(
                      item.icon,
                      item.title,
                      item.subtitle,
                      item.color,
                      item.badge,
                      () => navigation.navigate(item.route)
                    )}
                  </View>
                ))}

                {renderSectionTitle('Hỗ trợ chuyên nghiệp')}
                {supportFeatures.map((item, index) => (
                  <View key={`support-${index}`}>
                    {renderMenuItem(
                      item.icon,
                      item.title,
                      item.subtitle,
                      item.color,
                      item.badge,
                      () => navigation.navigate(item.route)
                    )}
                  </View>
                ))}
              </>
            )}

            {renderSectionTitle('Tài khoản & Cài đặt')}
            {accountFeatures.map((item, index) => (
              <View key={`account-${index}`}>
                {renderMenuItem(
                  item.icon,
                  item.title,
                  item.subtitle,
                  item.color,
                  item.badge,
                  () => {
                    if (item.route === 'NotFound') {
                      navigation.navigate(item.route, { featureName: item.title });
                    } else {
                      navigation.navigate(item.route);
                    }
                  }
                )}
              </View>
            ))}

            {isAuthenticated && (
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#EF4444' }]}>
                  <MaterialCommunityIcons name="logout" size={24} color="#fff" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: '#EF4444' }]}>Đăng xuất</Text>
                  <Text style={styles.menuSubtitle}>Thoát khỏi tài khoản hiện tại</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Sero Chat - Người bạn đồng hành sức khỏe tâm lý</Text>
              <Text style={styles.footerSubtext}>© 2026 Sero Chat. All rights reserved.</Text>
            </View>
          </>
        )}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  editProfileButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  menuBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default MenuScreen;
