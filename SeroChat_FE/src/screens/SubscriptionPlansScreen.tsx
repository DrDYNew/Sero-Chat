import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionPlanService } from '../services/subscriptionPlanService';

interface SubscriptionPlan {
  planId: number;
  planName: string;
  price: number;
  durationDays: number;
  dailyMessageLimit: number | null;
}

const SubscriptionPlansScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionPlanService.getAllPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách gói');
      }
    } catch (error) {
      console.error('Load plans error:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const isPremiumActive = () => {
    if (!user?.premiumExpiry) return false;
    const expiryDate = new Date(user.premiumExpiry);
    const now = new Date();
    return expiryDate > now && (user.subscriptionStatus === 'premium' || user.subscriptionStatus === 'active');
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user?.id) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để đăng ký gói dịch vụ',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    // Check if user already has active premium
    if (plan.price > 0 && isPremiumActive()) {
      Alert.alert(
        'Đã sở hữu',
        'Bạn đã sở hữu gói Premium. Vui lòng đợi đến khi hết hạn để gia hạn.',
        [{ text: 'OK' }]
      );
      return;
    }

    // If it's a free plan, handle differently
    if (plan.price === 0) {
      Alert.alert(
        'Gói miễn phí',
        'Gói miễn phí đã được kích hoạt cho tài khoản của bạn.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
      return;
    }

    // Navigate to payment screen for paid plans
    navigation.navigate('Payment', { plan });
  };

  const getPlanColor = (price: number) => {
    if (price === 0) return ['#10B981', '#059669'];
    if (price < 100000) return ['#3B82F6', '#2563EB'];
    if (price < 500000) return ['#8B5CF6', '#7C3AED'];
    return ['#F59E0B', '#D97706'];
  };

  const getPlanIcon = (price: number) => {
    if (price === 0) return 'account-outline';
    if (price < 100000) return 'star-outline';
    if (price < 500000) return 'crown-outline';
    return 'diamond-stone';
  };

  const renderPlanFeature = (text: string) => (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const colors = getPlanColor(plan.price);
    const icon = getPlanIcon(plan.price);
    const isPopular = plan.price > 0 && plan.price < 500000;
    const isOwned = plan.price > 0 && isPremiumActive();

    return (
      <View key={plan.planId} style={styles.planCardWrapper}>
        {isPopular && !isOwned && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Phổ biến nhất</Text>
          </View>
        )}
        {isOwned && (
          <View style={[styles.popularBadge, { backgroundColor: '#10B981' }]}>
            <Text style={styles.popularText}>Đã sở hữu</Text>
          </View>
        )}
        
        <View style={[styles.planCard, isPopular && styles.popularCard]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planHeader}
          >
            <MaterialCommunityIcons name={icon as any} size={48} color="#FFF" />
            <Text style={styles.planName}>{plan.planName}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {plan.price === 0 ? 'Miễn phí' : `${plan.price.toLocaleString('vi-VN')}đ`}
              </Text>
              {plan.price > 0 && (
                <Text style={styles.priceDuration}>/{plan.durationDays} ngày</Text>
              )}
            </View>
          </LinearGradient>

          <View style={styles.planBody}>
            <View style={styles.featuresContainer}>
              {renderPlanFeature(
                plan.dailyMessageLimit 
                  ? `${plan.dailyMessageLimit} tin nhắn mỗi ngày` 
                  : 'Tin nhắn không giới hạn'
              )}
              {renderPlanFeature(`Sử dụng trong ${plan.durationDays} ngày`)}
              
              {plan.price === 0 ? (
                <>
                  {renderPlanFeature('Trò chuyện với AI cơ bản')}
                  {renderPlanFeature('Truy cập blog & bài viết')}
                </>
              ) : (
                <>
                  {renderPlanFeature('Ưu tiên phản hồi nhanh')}
                  {renderPlanFeature('Truy cập tính năng premium')}
                  {renderPlanFeature('Lưu trữ lịch sử không giới hạn')}
                  {renderPlanFeature('Hỗ trợ khách hàng 24/7')}
                  {plan.price >= 500000 && renderPlanFeature('Tư vấn với chuyên gia')}
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.subscribeButton,
                (selectedPlanId === plan.planId || isOwned) && styles.subscribeButtonDisabled
              ]}
              onPress={() => handleSubscribe(plan)}
              disabled={selectedPlanId === plan.planId || isOwned}
            >
              <LinearGradient
                colors={
                  selectedPlanId === plan.planId || isOwned 
                    ? ['#9CA3AF', '#6B7280'] 
                    : colors
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeGradient}
              >
                <Text style={styles.subscribeText}>
                  {isOwned 
                    ? 'Đã sở hữu' 
                    : plan.price === 0 
                      ? 'Sử dụng miễn phí' 
                      : 'Đăng ký ngay'
                  }
                </Text>
                {!isOwned && (
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gói dịch vụ</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Đang tải danh sách gói...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <MaterialCommunityIcons name="crown" size={80} color="#F59E0B" />
            </View>
            <Text style={styles.heroTitle}>Nâng cấp trải nghiệm</Text>
            <Text style={styles.heroSubtitle}>
              Chọn gói phù hợp để tận hưởng đầy đủ tính năng của Sero Chat
            </Text>
          </View>

          {/* Plans List */}
          <View style={styles.plansContainer}>
            {plans.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="package-variant" size={64} color="#CCC" />
                <Text style={styles.emptyText}>Chưa có gói dịch vụ nào</Text>
              </View>
            ) : (
              plans.map(plan => renderPlanCard(plan))
            )}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="shield-check" size={32} color="#10B981" />
              <Text style={styles.infoTitle}>Bảo mật tuyệt đối</Text>
              <Text style={styles.infoText}>
                Mọi thông tin cá nhân và cuộc trò chuyện của bạn được mã hóa và bảo mật
              </Text>
            </View>

            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="cash-refund" size={32} color="#3B82F6" />
              <Text style={styles.infoTitle}>Hoàn tiền 100%</Text>
              <Text style={styles.infoText}>
                Nếu không hài lòng, bạn có thể yêu cầu hoàn tiền trong 7 ngày
              </Text>
            </View>

            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="headset" size={32} color="#8B5CF6" />
              <Text style={styles.infoTitle}>Hỗ trợ 24/7</Text>
              <Text style={styles.infoText}>
                Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  heroIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  planCardWrapper: {
    marginBottom: 24,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    right: 20,
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  popularText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    transform: [{ scale: 1.02 }],
  },
  planHeader: {
    padding: 32,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  priceDuration: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginLeft: 4,
  },
  planBody: {
    padding: 24,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  subscribeText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default SubscriptionPlansScreen;
