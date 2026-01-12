import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { subscriptionPlanService } from '../services/subscriptionPlanService';

export default function AddEditSubscriptionPlanScreen({ route, navigation }: any) {
  const { planId, mode } = route.params || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    planName: '',
    price: '',
    durationDays: '',
    dailyMessageLimit: '',
  });

  useEffect(() => {
    if (isEditMode && planId) {
      loadPlanData();
    }
  }, [planId]);

  const loadPlanData = async () => {
    try {
      setLoading(true);
      const response = await subscriptionPlanService.getPlanById(planId);
      if (response.success && response.data) {
        const plan = response.data;
        setFormData({
          planName: plan.planName || '',
          price: plan.price?.toString() || '',
          durationDays: plan.durationDays?.toString() || '',
          dailyMessageLimit: plan.dailyMessageLimit?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Load plan error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.planName || !formData.price || !formData.durationDays) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const price = parseFloat(formData.price);
    const durationDays = parseInt(formData.durationDays);
    const dailyMessageLimit = formData.dailyMessageLimit ? parseInt(formData.dailyMessageLimit) : null;

    if (isNaN(price) || price <= 0) {
      Alert.alert('Lỗi', 'Giá phải lớn hơn 0đ');
      return;
    }

    if (isNaN(durationDays) || durationDays <= 0) {
      Alert.alert('Lỗi', 'Số ngày phải là số nguyên dương');
      return;
    }

    try {
      setSaving(true);
      const planData = {
        planName: formData.planName,
        price,
        durationDays,
        dailyMessageLimit,
      };

      const response = isEditMode
        ? await subscriptionPlanService.updatePlan(planId, planData)
        : await subscriptionPlanService.createPlan(planData);

      if (response.success) {
        Alert.alert(
          'Thành công',
          isEditMode ? 'Cập nhật gói dịch vụ thành công' : 'Tạo gói dịch vụ thành công',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('ManageSubscriptionPlans', { refresh: Date.now() });
              },
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể lưu gói dịch vụ');
      }
    } catch (error) {
      console.error('Save plan error:', error);
      Alert.alert('Lỗi', 'Không thể lưu gói dịch vụ');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}</Text>
            <View style={{ width: 40 }} />
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
          <Text style={styles.headerTitle}>{isEditMode ? 'Chỉnh sửa gói dịch vụ' : 'Thêm gói dịch vụ'}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Thông tin gói</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tên gói <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="crown" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="VD: Premium 1 tháng"
                value={formData.planName}
                onChangeText={(value) => updateField('planName', value)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Giá (VNĐ) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="cash" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="99000"
                value={formData.price}
                onChangeText={(value) => updateField('price', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Thời hạn (ngày) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="30"
                value={formData.durationDays}
                onChangeText={(value) => updateField('durationDays', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới hạn tin nhắn/ngày</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="message-text" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Để trống = không giới hạn"
                value={formData.dailyMessageLimit}
                onChangeText={(value) => updateField('dailyMessageLimit', value)}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.hint}>Bỏ trống nếu không giới hạn số tin nhắn</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>{isEditMode ? 'Cập nhật' : 'Tạo mới'}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 10, paddingBottom: 15, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1f2937' },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  saveButton: { backgroundColor: '#667eea', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16, borderRadius: 12, marginTop: 16, shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
