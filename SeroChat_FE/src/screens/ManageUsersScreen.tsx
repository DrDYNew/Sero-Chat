import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';

interface User {
  userId: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: string;
  subscriptionStatus: string;
  status: string;
  isVerify: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export default function ManageUsersScreen({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<string>('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.page, selectedRole, selectedStatus, selectedSubscription]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers(
        pagination.page,
        pagination.pageSize,
        searchText,
        selectedRole,
        selectedStatus,
        selectedSubscription
      );

      if (response.success && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Load users error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    loadUsers();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPagination({ ...pagination, page: 1 });
    await loadUsers();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedRole('');
    setSelectedStatus('');
    setSelectedSubscription('');
    setPagination({ ...pagination, page: 1 });
  };

  const goToPage = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'INACTIVE': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? '#f59e0b' : '#3b82f6';
  };

  const getSubscriptionColor = (sub: string) => {
    return sub === 'PREMIUM' ? '#ec4899' : '#6b7280';
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý người dùng</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('AddEditUser', { mode: 'create' })}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo email, tên, SĐT..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); handleSearch(); }}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, selectedRole === 'USER' && styles.filterChipActive]}
            onPress={() => setSelectedRole(selectedRole === 'USER' ? '' : 'USER')}
          >
            <Text style={[styles.filterChipText, selectedRole === 'USER' && styles.filterChipTextActive]}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedRole === 'ADMIN' && styles.filterChipActive]}
            onPress={() => setSelectedRole(selectedRole === 'ADMIN' ? '' : 'ADMIN')}
          >
            <Text style={[styles.filterChipText, selectedRole === 'ADMIN' && styles.filterChipTextActive]}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'ACTIVE' && styles.filterChipActive]}
            onPress={() => setSelectedStatus(selectedStatus === 'ACTIVE' ? '' : 'ACTIVE')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'ACTIVE' && styles.filterChipTextActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'INACTIVE' && styles.filterChipActive]}
            onPress={() => setSelectedStatus(selectedStatus === 'INACTIVE' ? '' : 'INACTIVE')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'INACTIVE' && styles.filterChipTextActive]}>Inactive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedSubscription === 'PREMIUM' && styles.filterChipActive]}
            onPress={() => setSelectedSubscription(selectedSubscription === 'PREMIUM' ? '' : 'PREMIUM')}
          >
            <Text style={[styles.filterChipText, selectedSubscription === 'PREMIUM' && styles.filterChipTextActive]}>Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedSubscription === 'FREE' && styles.filterChipActive]}
            onPress={() => setSelectedSubscription(selectedSubscription === 'FREE' ? '' : 'FREE')}
          >
            <Text style={[styles.filterChipText, selectedSubscription === 'FREE' && styles.filterChipTextActive]}>Free</Text>
          </TouchableOpacity>
          {(selectedRole || selectedStatus || selectedSubscription) && (
            <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
              <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>Tổng: {pagination.totalItems} người dùng</Text>
          <Text style={styles.statsText}>Trang {pagination.page}/{pagination.totalPages}</Text>
        </View>

        {/* Users List */}
        <ScrollView
          style={styles.usersList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : users.length > 0 ? (
            users.map((user) => (
              <TouchableOpacity 
                key={user.userId} 
                style={styles.userCard}
                onPress={() => navigation.navigate('UserDetail', { userId: user.userId })}
                activeOpacity={0.7}
              >
                <View style={styles.userHeader}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{ uri: user.avatarUrl || 'https://via.placeholder.com/60' }}
                      style={styles.avatar}
                    />
                    {!user.isVerify && (
                      <View style={styles.unverifiedBadge}>
                        <MaterialCommunityIcons name="alert-circle" size={14} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName} numberOfLines={1}>{user.fullName}</Text>
                      {user.role === 'ADMIN' && (
                        <MaterialCommunityIcons name="shield-crown" size={18} color="#f59e0b" />
                      )}
                    </View>
                    <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                    {user.phoneNumber && (
                      <View style={styles.phoneRow}>
                        <MaterialCommunityIcons name="phone" size={14} color="#9ca3af" />
                        <Text style={styles.userPhone}>{user.phoneNumber}</Text>
                      </View>
                    )}
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                </View>

                <View style={styles.userFooter}>
                  <View style={styles.userBadges}>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(user.status) + '15', borderColor: getStatusColor(user.status) }]}>
                      <MaterialCommunityIcons 
                        name={user.status === 'ACTIVE' ? 'check-circle' : 'close-circle'} 
                        size={12} 
                        color={getStatusColor(user.status)} 
                      />
                      <Text style={[styles.badgeText, { color: getStatusColor(user.status) }]}>{user.status}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getSubscriptionColor(user.subscriptionStatus) + '15', borderColor: getSubscriptionColor(user.subscriptionStatus) }]}>
                      <MaterialCommunityIcons 
                        name={user.subscriptionStatus === 'PREMIUM' ? 'crown' : 'account'} 
                        size={12} 
                        color={getSubscriptionColor(user.subscriptionStatus)} 
                      />
                      <Text style={[styles.badgeText, { color: getSubscriptionColor(user.subscriptionStatus) }]}>
                        {user.subscriptionStatus}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userDate}>
                    <MaterialCommunityIcons name="calendar" size={12} color="#9ca3af" />
                    {' '}{new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-off" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
            </View>
          )}
        </ScrollView>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.pageButton, pagination.page === 1 && styles.pageButtonDisabled]}
              onPress={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color={pagination.page === 1 ? '#d1d5db' : '#667eea'} />
            </TouchableOpacity>

            <View style={styles.pageNumbers}>
              {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = index + 1;
                } else if (pagination.page <= 3) {
                  pageNum = index + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + index;
                } else {
                  pageNum = pagination.page - 2 + index;
                }

                return (
                  <TouchableOpacity
                    key={pageNum}
                    style={[styles.pageNumber, pagination.page === pageNum && styles.pageNumberActive]}
                    onPress={() => goToPage(pageNum)}
                  >
                    <Text style={[styles.pageNumberText, pagination.page === pageNum && styles.pageNumberTextActive]}>
                      {pageNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.pageButton, pagination.page === pagination.totalPages && styles.pageButtonDisabled]}
              onPress={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={pagination.page === pagination.totalPages ? '#d1d5db' : '#667eea'}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1f2937' },
  filtersContainer: { marginTop: 12, maxHeight: 50 },
  filterChip: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: '#667eea', borderColor: '#667eea' },
  filterChipText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  clearFilterButton: { backgroundColor: '#ef4444', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  clearFilterText: { fontSize: 14, color: '#fff', fontWeight: '500' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 12 },
  statsText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  usersList: { flex: 1 },
  userCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#f3f4f6' },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#e5e7eb' },
  unverifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#f59e0b', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  userName: { fontSize: 17, fontWeight: '700', color: '#1f2937', flex: 1 },
  userEmail: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userPhone: { fontSize: 13, color: '#9ca3af' },
  userFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  userBadges: { flexDirection: 'row', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  userDate: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#9ca3af' },
  paginationContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, backgroundColor: '#fff', borderRadius: 12, marginTop: 12, marginBottom: 12 },
  pageButton: { padding: 8 },
  pageButtonDisabled: { opacity: 0.3 },
  pageNumbers: { flexDirection: 'row', marginHorizontal: 16 },
  pageNumber: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, backgroundColor: '#f3f4f6' },
  pageNumberActive: { backgroundColor: '#667eea' },
  pageNumberText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  pageNumberTextActive: { color: '#fff' },
});
