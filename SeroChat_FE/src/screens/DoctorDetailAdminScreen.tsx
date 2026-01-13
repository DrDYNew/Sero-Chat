import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import doctorService from '../services/doctorService';

interface Certificate {
  certId: number;
  certificateName: string;
  imageUrl: string;
  uploadedAt: string;
}

interface DoctorDetail {
  doctorId: number;
  name: string;
  specialtyName: string;
  experienceYears: number;
  phone: string;
  zaloUrl: string;
  address: string;
  bioDetail: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  certificates: Certificate[];
}

const DoctorDetailAdminScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { doctorId } = route.params;

  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);

  useEffect(() => {
    loadDoctor();
  }, []);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const response = await doctorService.adminGetDoctorById(doctorId);
      if (response.success && response.data) {
        setDoctor(response.data);
      }
    } catch (error) {
      console.error('Error loading doctor:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditDoctor', { doctorId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bác sĩ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await doctorService.adminDeleteDoctor(doctorId);
              if (response.success) {
                Alert.alert('Thành công', 'Đã xóa bác sĩ', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              }
            } catch (error) {
              console.error('Error deleting doctor:', error);
              Alert.alert('Lỗi', 'Không thể xóa bác sĩ');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin bác sĩ</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin bác sĩ</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <MaterialCommunityIcons name="pencil" size={24} color="#667EEA" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar and Status */}
        <View style={styles.avatarSection}>
          {doctor.imageUrl ? (
            <Image source={{ uri: doctor.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="doctor" size={60} color="#667EEA" />
            </View>
          )}
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <View style={[styles.statusBadge, doctor.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>
              {doctor.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="stethoscope" size={20} color="#667EEA" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Chuyên khoa</Text>
              <Text style={styles.infoValue}>{doctor.specialtyName}</Text>
            </View>
          </View>

          {doctor.experienceYears ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="briefcase" size={20} color="#667EEA" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Kinh nghiệm</Text>
                <Text style={styles.infoValue}>{doctor.experienceYears} năm</Text>
              </View>
            </View>
          ) : null}

          {doctor.phone ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={20} color="#667EEA" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{doctor.phone}</Text>
              </View>
            </View>
          ) : null}

          {doctor.zaloUrl ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="message-text" size={20} color="#667EEA" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Zalo</Text>
                <Text style={[styles.infoValue, styles.linkText]} numberOfLines={1}>
                  {doctor.zaloUrl}
                </Text>
              </View>
            </View>
          ) : null}

          {doctor.address ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#667EEA" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.infoValue}>{doctor.address}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#667EEA" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày tạo</Text>
              <Text style={styles.infoValue}>
                {new Date(doctor.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        {doctor.bioDetail ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiểu sử</Text>
            <Text style={styles.bioText}>{doctor.bioDetail}</Text>
          </View>
        ) : null}

        {/* Certificates */}
        {doctor.certificates && doctor.certificates.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chứng chỉ ({doctor.certificates.length})</Text>
            {doctor.certificates.map((cert) => (
              <View key={cert.certId} style={styles.certCard}>
                {cert.imageUrl ? (
                  <Image source={{ uri: cert.imageUrl }} style={styles.certImage} />
                ) : (
                  <View style={styles.certImagePlaceholder}>
                    <MaterialCommunityIcons name="certificate" size={40} color="#667EEA" />
                  </View>
                )}
                <View style={styles.certInfo}>
                  <Text style={styles.certName}>{cert.certificateName}</Text>
                  <Text style={styles.certDate}>
                    {new Date(cert.uploadedAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Xóa bác sĩ</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  editButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#DEF7EC',
  },
  inactiveBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  linkText: {
    color: '#667EEA',
  },
  bioText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  certCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  certImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  certImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  certName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  certDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default DoctorDetailAdminScreen;
