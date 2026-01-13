import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import doctorService from '../services/doctorService';

interface Specialty {
  specialtyId: number;
  specialtyName: string;
}

interface DoctorDetail {
  doctorId: number;
  name: string;
  specialtyId: number;
  experienceYears: number;
  phone: string;
  zaloUrl: string;
  address: string;
  bioDetail: string;
  imageUrl: string;
  isActive: boolean;
}

const EditDoctorScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { doctorId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    specialtyId: 0,
    experienceYears: '',
    phone: '',
    zaloUrl: '',
    address: '',
    bioDetail: '',
    imageUrl: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorRes, specialtiesRes] = await Promise.all([
        doctorService.adminGetDoctorById(doctorId),
        doctorService.adminGetSpecialties(),
      ]);

      if (doctorRes.success && doctorRes.data) {
        setDoctor(doctorRes.data);
        setFormData({
          name: doctorRes.data.name,
          specialtyId: doctorRes.data.specialtyId,
          experienceYears: doctorRes.data.experienceYears?.toString() || '',
          phone: doctorRes.data.phone || '',
          zaloUrl: doctorRes.data.zaloUrl || '',
          address: doctorRes.data.address || '',
          bioDetail: doctorRes.data.bioDetail || '',
          imageUrl: doctorRes.data.imageUrl || '',
        });
      }

      if (specialtiesRes.success) {
        setSpecialties(specialtiesRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const response = await doctorService.adminUploadAvatar(doctorId, uri);
      
      if (response.success && response.data?.imageUrl) {
        setFormData({ ...formData, imageUrl: response.data.imageUrl });
        Alert.alert('Thành công', 'Tải ảnh lên thành công');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bác sĩ');
      return;
    }
    if (!formData.specialtyId) {
      Alert.alert('Lỗi', 'Vui lòng chọn chuyên khoa');
      return;
    }
    if (formData.phone && formData.phone.length < 10) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }

    try {
      setSaving(true);
      const response = await doctorService.adminUpdateDoctor(doctorId, {
        name: formData.name,
        specialtyId: formData.specialtyId,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
        phone: formData.phone || undefined,
        zaloUrl: formData.zaloUrl || undefined,
        address: formData.address || undefined,
        bioDetail: formData.bioDetail || undefined,
        imageUrl: formData.imageUrl || undefined,
      });

      if (response.success) {
        Alert.alert('Thành công', 'Đã cập nhật thông tin bác sĩ', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
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
        <Text style={styles.headerTitle}>Sửa thông tin</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={uploading}>
            {formData.imageUrl ? (
              <Image source={{ uri: formData.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="doctor" size={48} color="#667EEA" />
              </View>
            )}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage} disabled={uploading}>
            <MaterialCommunityIcons name="camera" size={20} color="#667EEA" />
            <Text style={styles.uploadText}>Đổi ảnh</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên bác sĩ *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên đầy đủ"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chuyên khoa *</Text>
            <View style={styles.pickerContainer}>
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty.specialtyId}
                  style={[
                    styles.specialtyChip,
                    formData.specialtyId === specialty.specialtyId && styles.specialtyChipSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, specialtyId: specialty.specialtyId })}
                >
                  <Text
                    style={[
                      styles.specialtyChipText,
                      formData.specialtyId === specialty.specialtyId && styles.specialtyChipTextSelected,
                    ]}
                  >
                    {specialty.specialtyName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số năm kinh nghiệm</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 5"
              keyboardType="numeric"
              value={formData.experienceYears}
              onChangeText={(text) => setFormData({ ...formData, experienceYears: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="0987654321"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zalo URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://zalo.me/..."
              value={formData.zaloUrl}
              onChangeText={(text) => setFormData({ ...formData, zaloUrl: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập địa chỉ phòng khám"
              multiline
              numberOfLines={2}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tiểu sử</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Giới thiệu về bác sĩ..."
              multiline
              numberOfLines={4}
              value={formData.bioDetail}
              onChangeText={(text) => setFormData({ ...formData, bioDetail: text })}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  uploadText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  specialtyChipSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  specialtyChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  specialtyChipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#667EEA',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default EditDoctorScreen;
