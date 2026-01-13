import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import doctorService, { DoctorDetail } from '../services/doctorService';
import { useTheme } from '../contexts/ThemeContext';

const DoctorDetailScreen = ({ route, navigation }: any) => {
  const { doctorId } = route.params;
  const { colors, isDarkMode } = useTheme();
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctorDetail();
  }, []);

  const loadDoctorDetail = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getDoctorById(doctorId);
      if (response.success) {
        setDoctor(response.data);
      }
    } catch (error) {
      console.error('Error loading doctor detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (doctor?.phone) {
      Linking.openURL(`tel:${doctor.phone}`);
    }
  };

  const handleZalo = () => {
    if (doctor?.zaloUrl) {
      Linking.openURL(doctor.zaloUrl);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? '#334155' : '#e0e0e0' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Thông tin bác sĩ</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!doctor) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? '#334155' : '#e0e0e0' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Thông tin bác sĩ</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Không tìm thấy thông tin bác sĩ</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? '#334155' : '#e0e0e0' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thông tin bác sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.imageContainer}>
            {doctor.imageUrl ? (
              <Image source={{ uri: doctor.imageUrl }} style={styles.doctorImage} />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? '#1E293B' : '#E6F7F5' }]}>
                <MaterialCommunityIcons name="doctor" size={60} color="#14B8A6" />
              </View>
            )}
            {doctor.certificates.length > 0 && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={24} color="#14B8A6" />
              </View>
            )}
          </View>

          <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.name}</Text>
          
          <View style={[styles.specialtyTag, { backgroundColor: isDarkMode ? '#1E293B' : '#E6F7F5' }]}>
            <MaterialCommunityIcons name="stethoscope" size={16} color="#14B8A6" />
            <Text style={styles.specialtyText}>{doctor.specialtyName}</Text>
          </View>

          {doctor.experienceYears && (
            <View style={styles.experienceRow}>
              <MaterialCommunityIcons name="briefcase-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.experienceText, { color: colors.textSecondary }]}>
                {doctor.experienceYears} năm kinh nghiệm
              </Text>
            </View>
          )}
        </View>

        {/* Contact Buttons */}
        <View style={styles.contactSection}>
          {doctor.phone && (
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <MaterialCommunityIcons name="phone" size={24} color="#fff" />
              <Text style={styles.contactButtonText}>Gọi điện</Text>
            </TouchableOpacity>
          )}
          {doctor.zaloUrl && (
            <TouchableOpacity style={styles.contactButton} onPress={handleZalo}>
              <MaterialCommunityIcons name="message-text" size={24} color="#fff" />
              <Text style={styles.contactButtonText}>Nhắn Zalo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bio Section */}
        {doctor.bioDetail && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Giới thiệu</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>{doctor.bioDetail}</Text>
            </View>
          </View>
        )}

        {/* Specialty Details */}
        {doctor.specialtyDescription && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Chuyên khoa</Text>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{doctor.specialtyDescription}</Text>
            </View>
          </View>
        )}

        {/* Address */}
        {doctor.address && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Địa chỉ</Text>
            <View style={styles.sectionContent}>
              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#14B8A6" />
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>{doctor.address}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Certificates */}
        {doctor.certificates.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Chứng chỉ ({doctor.certificates.length})
            </Text>
            <View style={styles.certificatesGrid}>
              {doctor.certificates.map((cert) => (
                <View key={cert.certId} style={[styles.certificateCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB' }]}>
                  <Image
                    source={{ uri: cert.imageUrl }}
                    style={styles.certificateImage}
                  />
                  {cert.certificateName && (
                    <Text style={[styles.certificateName, { color: colors.text }]} numberOfLines={2}>
                      {cert.certificateName}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  doctorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F7F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 3,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  specialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  specialtyText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  experienceText: {
    fontSize: 14,
    color: '#666',
  },
  contactSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 8,
    borderBottomColor: '#f8f9fa',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionContent: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  bioText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  certificatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  certificateCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  certificateImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  certificateName: {
    padding: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default DoctorDetailScreen;
