import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { adminService, DashboardStats, RecentActivity } from '../services/adminService';

const { width } = Dimensions.get('window');

interface StatCard {
  icon: string;
  title: string;
  value: string;
  color: string;
  bgColor: string;
  change?: string;
  isPositive?: boolean;
}

export default function AdminDashboard({ navigation }: any) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activitiesResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivities(10),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        Alert.alert('Lỗi', statsResponse.message || 'Không thể tải thống kê');
      }

      if (activitiesResponse.success && activitiesResponse.data) {
        setActivities(activitiesResponse.data);
      }
    } catch (error) {
      console.error('Load dashboard data error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const statCards: StatCard[] = stats
    ? [
        {
          icon: 'account-group',
          title: 'Tổng người dùng',
          value: stats.totalUsers.toString(),
          color: '#3b82f6',
          bgColor: '#dbeafe',
          change: `+${stats.userChangePercent}%`,
          isPositive: stats.userChangePercent >= 0,
        },
        {
          icon: 'post',
          title: 'Bài viết Blog',
          value: stats.totalBlogs.toString(),
          color: '#8b5cf6',
          bgColor: '#ede9fe',
          change: `+${stats.newBlogsThisMonth}`,
          isPositive: true,
        },
        {
          icon: 'doctor',
          title: 'Bác sĩ',
          value: stats.totalDoctors.toString(),
          color: '#10b981',
          bgColor: '#d1fae5',
          change: `+${stats.newDoctorsThisMonth}`,
          isPositive: true,
        },
        {
          icon: 'alert-circle',
          title: 'Khủng hoảng',
          value: stats.unresolvedCrisis.toString(),
          color: '#ef4444',
          bgColor: '#fee2e2',
          change: `${stats.crisisChange >= 0 ? '+' : ''}${stats.crisisChange}`,
          isPositive: stats.crisisChange <= 0,
        },
        {
          icon: 'cash',
          title: 'Doanh thu tháng',
          value: formatCurrency(stats.revenueThisMonth),
          color: '#f59e0b',
          bgColor: '#fef3c7',
          change: `${stats.revenueChangePercent >= 0 ? '+' : ''}${stats.revenueChangePercent}%`,
          isPositive: stats.revenueChangePercent >= 0,
        },
        {
          icon: 'account-check',
          title: 'Premium Users',
          value: stats.premiumUsers.toString(),
          color: '#ec4899',
          bgColor: '#fce7f3',
          change: `${stats.premiumChangePercent >= 0 ? '+' : ''}${stats.premiumChangePercent}%`,
          isPositive: stats.premiumChangePercent >= 0,
        },
      ]
    : [];

  const quickActions = [
    { icon: 'account-plus', title: 'Thêm User', screen: 'AddEditUser', params: { mode: 'create' }, color: '#3b82f6' },
    { icon: 'post-outline', title: 'Tạo Blog', screen: 'ManageBlogs', color: '#8b5cf6' },
    { icon: 'doctor', title: 'Thêm Bác sĩ', screen: 'ManageDoctors', color: '#10b981' },
    { icon: 'bell-plus', title: 'Gửi Thông báo', screen: 'ManageNotifications', color: '#f59e0b' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarOpen(true)}>
            <MaterialCommunityIcons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons name="shield-crown" size={24} color="#fbbf24" />
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('ManageNotifications')}>
            <MaterialCommunityIcons name="bell" size={24} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Xin chào, {user?.fullName || 'Admin'} 👋</Text>
          <Text style={styles.welcomeSubtext}>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
          {loading ? (
            <Text style={styles.loadingText}>Đang tải...</Text>
          ) : (
            <View style={styles.statsGrid}>
              {statCards.map((stat, index) => (
                <TouchableOpacity key={index} style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                    <MaterialCommunityIcons name={stat.icon as any} size={28} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  {stat.change && (
                    <View style={styles.changeContainer}>
                      <MaterialCommunityIcons name={stat.isPositive ? 'trending-up' : 'trending-down'} size={14} color={stat.isPositive ? '#10b981' : '#ef4444'} />
                      <Text style={[styles.changeText, { color: stat.isPositive ? '#10b981' : '#ef4444' }]}>{stat.change}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionCard} 
                onPress={() => action.params ? navigation.navigate(action.screen, action.params) : navigation.navigate(action.screen)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <MaterialCommunityIcons name={action.icon as any} size={32} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>Xem tất cả</Text></TouchableOpacity>
          </View>
          <View style={styles.activitiesContainer}>
            {loading ? (
              <Text style={styles.loadingText}>Đang tải...</Text>
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                    <MaterialCommunityIcons name={activity.icon as any} size={20} color={activity.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{activity.text}</Text>
                    <Text style={styles.activityTime}>{formatTimeAgo(activity.time)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
            )}
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 20, paddingBottom: 25, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  menuButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#ef4444', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  welcomeSection: { marginTop: 10 },
  welcomeText: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  welcomeSubtext: { fontSize: 13, color: 'rgba(255, 255, 255, 0.8)' },
  content: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  seeAllText: { fontSize: 14, color: '#667eea', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statIconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  statTitle: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  changeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeText: { fontSize: 12, fontWeight: '600' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionCard: { width: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  quickActionIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  quickActionText: { fontSize: 14, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
  activitiesContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  activityIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: '#1f2937', marginBottom: 4 },
  activityTime: { fontSize: 12, color: '#9ca3af' },
  loadingText: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingVertical: 20 },
});
