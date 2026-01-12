import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Linking,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import paymentService from '../services/paymentService';
import ENV from '../config/env';

// Get base URL without /api
const BASE_URL = ENV.API_BASE_URL.replace('/api', '');

interface SubscriptionPlan {
  planId: number;
  planName: string;
  price: number;
  durationDays: number;
  dailyMessageLimit: number | null;
}

const PaymentScreen = ({ route, navigation }: any) => {
  const { plan } = route.params as { plan: SubscriptionPlan };
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handlePayment = async () => {
    if (!user?.id) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để thanh toán');
      navigation.navigate('Login');
      return;
    }

    try {
      setLoading(true);

      // Create payment request
      const request = {
        planId: plan.planId,
        returnUrl: `${BASE_URL}/payment/success`,
        cancelUrl: `${BASE_URL}/payment/cancel`,
      };

      const response = await paymentService.createPayment(request);

      if (response.success && response.data) {
        // Navigate to QR Payment screen
        navigation.navigate('PaymentQR', {
          paymentData: response.data,
          planName: plan.planName,
        });
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tạo thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderCode: string) => {
    try {
      setLoading(true);
      const response = await paymentService.verifyPayment(orderCode);

      if (response.success && response.data) {
        if (response.data.status === 'Success') {
          Alert.alert(
            'Thành công!',
            'Thanh toán đã được xác nhận. Gói dịch vụ của bạn đã được kích hoạt.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Home'),
              },
            ]
          );
        } else if (response.data.status === 'Pending') {
          Alert.alert(
            'Đang xử lý',
            'Thanh toán đang được xử lý. Vui lòng đợi trong giây lát.',
            [
              {
                text: 'Kiểm tra lại',
                onPress: () => handleVerifyPayment(orderCode),
              },
              {
                text: 'Hủy',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert('Thất bại', 'Thanh toán không thành công. Vui lòng thử lại.');
        }
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể kiểm tra thanh toán');
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi kiểm tra thanh toán');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Payment Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="credit-card-outline" size={80} color="#667EEA" />
          </View>
        </View>

        {/* Plan Details Card */}
        <View style={styles.planCard}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planGradient}
          >
            <MaterialCommunityIcons name="crown" size={40} color="#FFF" />
            <Text style={styles.planName}>{plan.planName}</Text>
          </LinearGradient>

          <View style={styles.planDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giá gói:</Text>
              <Text style={styles.detailValue}>
                {plan.price === 0 ? 'Miễn phí' : `${plan.price.toLocaleString('vi-VN')} VNĐ`}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời hạn:</Text>
              <Text style={styles.detailValue}>{plan.durationDays} ngày</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tin nhắn:</Text>
              <Text style={styles.detailValue}>
                {plan.dailyMessageLimit
                  ? `${plan.dailyMessageLimit} tin/ngày`
                  : 'Không giới hạn'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalValue}>
                {plan.price.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodIcon}>
              <MaterialCommunityIcons name="bank" size={32} color="#667EEA" />
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>PayOS</Text>
              <Text style={styles.paymentMethodDesc}>
                Thanh toán qua QR Code ngân hàng
              </Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />
            <Text style={styles.infoText}>Giao dịch được mã hóa và bảo mật</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-fast" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>Kích hoạt tức thì sau thanh toán</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="cash-refund" size={20} color="#F59E0B" />
            <Text style={styles.infoText}>Hoàn tiền 100% trong 7 ngày</Text>
          </View>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.paymentButton, loading && styles.paymentButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.paymentGradient}
            >
              <MaterialCommunityIcons name="lock-check" size={24} color="#FFF" />
              <Text style={styles.paymentButtonText}>Thanh toán ngay</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <Text style={styles.link}>Điều khoản dịch vụ</Text> và{' '}
          <Text style={styles.link}>Chính sách bảo mật</Text> của chúng tôi.
        </Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  planGradient: {
    padding: 24,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
  },
  planDetails: {
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#667EEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentMethodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  paymentMethodDesc: {
    fontSize: 13,
    color: '#666',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  paymentButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  paymentButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
  },
  link: {
    color: '#667EEA',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default PaymentScreen;
