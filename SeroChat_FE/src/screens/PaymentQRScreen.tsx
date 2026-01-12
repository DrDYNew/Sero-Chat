import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Clipboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import paymentService from '../services/paymentService';

interface RouteParams {
  paymentData: {
    checkoutUrl: string;
    orderCode: string;
    qrCode?: string;
    accountNumber?: string;
    accountName?: string;
    amount: number;
    expiredAt?: number;
  };
  planName: string;
}

const PaymentQRScreen = ({ navigation, route }: any) => {
  const { paymentData, planName } = route.params as RouteParams;
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [isPolling, setIsPolling] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [copied, setCopied] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!paymentData) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin thanh toán', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    // Calculate time left from expiredAt
    if (paymentData.expiredAt) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = paymentData.expiredAt - now;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }

    // Start polling for payment status
    startPolling();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && paymentStatus === 'pending') {
      setPaymentStatus('expired');
      setIsPolling(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [timeLeft, paymentStatus]);

  const startPolling = () => {
    checkPaymentStatus();
    pollingIntervalRef.current = setInterval(() => {
      if (isPolling && paymentStatus === 'pending') {
        checkPaymentStatus();
      }
    }, 3000);
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await paymentService.verifyPayment(paymentData.orderCode);
      
      if (response.success && response.data) {
        if (response.data.status === 'Completed' || response.data.status === 'Success') {
          setPaymentStatus('success');
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      }
    } catch (error) {
      console.log('Error checking payment status:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    setCopied(true);
    Alert.alert('Đã sao chép', `${label} đã được sao chép`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success Screen
  if (paymentStatus === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Thanh toán thành công!</Text>
          <Text style={styles.successMessage}>
            Gói {planName} đã được kích hoạt
          </Text>

          <View style={styles.successAmount}>
            <Text style={styles.successAmountLabel}>Số tiền đã thanh toán:</Text>
            <Text style={styles.successAmountValue}>{formatPrice(paymentData.amount)}</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.primaryButton}
          >
            <MaterialCommunityIcons name="home" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Menu')}
            style={styles.secondaryButton}
          >
            <MaterialCommunityIcons name="account" size={24} color="#6C5CE7" />
            <Text style={styles.secondaryButtonText}>Xem hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Expired Screen
  if (paymentStatus === 'expired') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: '#fee2e2' }]}>
            <MaterialCommunityIcons name="alert-circle" size={80} color="#ef4444" />
          </View>
          <Text style={[styles.successTitle, { color: '#ef4444' }]}>Hết thời gian thanh toán</Text>
          <Text style={styles.successMessage}>
            Vui lòng tạo giao dịch mới để tiếp tục
          </Text>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.primaryButton}
          >
            <MaterialCommunityIcons name="refresh" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // QR Payment Screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Hủy thanh toán?',
                'Bạn có chắc muốn hủy thanh toán không?',
                [
                  { text: 'Tiếp tục thanh toán', style: 'cancel' },
                  { text: 'Hủy', style: 'destructive', onPress: () => navigation.goBack() },
                ]
              );
            }}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="qrcode-scan" size={32} color="#6C5CE7" />
          </View>
          <Text style={styles.headerTitle}>Quét mã QR để thanh toán</Text>
          <Text style={styles.headerSubtitle}>
            Sử dụng ứng dụng ngân hàng để quét mã QR
          </Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrContainer}>
            {paymentData.qrCode ? (
              <QRCode
                value={paymentData.qrCode}
                size={240}
                backgroundColor="white"
                color="black"
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={styles.qrPlaceholderText}>Đang tạo mã QR...</Text>
              </View>
            )}
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#f59e0b" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerLabel}>Thời gian còn lại</Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gói dịch vụ:</Text>
            <Text style={styles.infoValue}>{planName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền:</Text>
            <Text style={[styles.infoValue, { color: '#6C5CE7', fontSize: 18, fontWeight: 'bold' }]}>
              {formatPrice(paymentData.amount)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã giao dịch:</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValueCode} numberOfLines={1}>
                {paymentData.orderCode}
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(paymentData.orderCode, 'Mã giao dịch')}
              >
                <MaterialCommunityIcons
                  name={copied ? 'check' : 'content-copy'}
                  size={20}
                  color="#6C5CE7"
                />
              </TouchableOpacity>
            </View>
          </View>

          {paymentData.accountNumber && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tài khoản:</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={styles.infoValueCode}>{paymentData.accountNumber}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(paymentData.accountNumber!, 'Số tài khoản')}
                  >
                    <MaterialCommunityIcons name="content-copy" size={20} color="#6C5CE7" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tên tài khoản:</Text>
                <Text style={styles.infoValue}>{paymentData.accountName}</Text>
              </View>
            </>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>
            <MaterialCommunityIcons name="information" size={18} color="#6C5CE7" />
            {' Hướng dẫn thanh toán'}
          </Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>Mở ứng dụng ngân hàng của bạn</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>Chọn chức năng quét mã QR</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>Quét mã QR trên màn hình này</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4</Text>
            <Text style={styles.instructionText}>Xác nhận thanh toán trong ứng dụng ngân hàng</Text>
          </View>
        </View>

        {/* Polling indicator */}
        <View style={styles.pollingIndicator}>
          <ActivityIndicator size="small" color="#6C5CE7" />
          <Text style={styles.pollingText}>Đang chờ thanh toán...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 10,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E8E4F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  qrPlaceholderText: {
    marginTop: 12,
    color: '#666666',
    fontSize: 14,
  },
  timerContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D97706',
    marginHorizontal: 8,
  },
  timerLabel: {
    fontSize: 12,
    color: '#D97706',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'right',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  infoValueCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 8,
  },
  instructionsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C5CE7',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  pollingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pollingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  successAmount: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  successAmountLabel: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 4,
  },
  successAmountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  primaryButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  secondaryButtonText: {
    color: '#6C5CE7',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PaymentQRScreen;
