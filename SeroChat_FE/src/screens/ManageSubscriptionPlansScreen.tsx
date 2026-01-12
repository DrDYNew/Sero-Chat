import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { subscriptionPlanService } from '../services/subscriptionPlanService';

interface SubscriptionPlan {
  planId: number;
  planName: string;
  price: number;
  durationDays: number;
  dailyMessageLimit: number | null;
}

export default function ManageSubscriptionPlansScreen({ navigation }: any) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadPlans();
    }, [])
  );

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionPlanService.getAllPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Load plans error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleDeletePlan = (planId: number, planName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa gói "${planName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const response = await subscriptionPlanService.deletePlan(planId);
            if (response.success) {
              Alert.alert('Thành công', 'Xóa gói dịch vụ thành công');
              loadPlans();
            } else {
              Alert.alert('Lỗi', response.message || 'Không thể xóa gói dịch vụ');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản lý gói dịch vụ</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý gói dịch vụ</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEditSubscriptionPlan', { mode: 'create' })}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />}
      >
        {plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Chưa có gói dịch vụ nào</Text>
          </View>
        ) : (
          plans.map((plan) => (
            <View key={plan.planId} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planIconContainer}>
                  <MaterialCommunityIcons name="crown" size={28} color="#ec4899" />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.planName}</Text>
                  <Text style={styles.planPrice}>{formatPrice(plan.price)}</Text>
                </View>
              </View>

              <View style={styles.planDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={18} color="#6b7280" />
                  <Text style={styles.detailText}>{plan.durationDays} ngày</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="message-text" size={18} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {plan.dailyMessageLimit ? `${plan.dailyMessageLimit} tin/ngày` : 'Không giới hạn'}
                  </Text>
                </View>
              </View>

              <View style={styles.planActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('AddEditSubscriptionPlan', { planId: plan.planId, mode: 'edit' })}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" />
                  <Text style={styles.editButtonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeletePlan(plan.planId, plan.planName)}
                >
                  <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#9ca3af' },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  planIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fce7f3', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  planPrice: { fontSize: 20, fontWeight: '800', color: '#ec4899' },
  planDetails: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  detailText: { marginLeft: 10, fontSize: 15, color: '#6b7280' },
  planActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10 },
  editButton: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#3b82f6' },
  editButtonText: { fontSize: 15, fontWeight: '600', color: '#3b82f6' },
  deleteButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#ef4444' },
  deleteButtonText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
});
