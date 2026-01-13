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
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { 
  adminGetRelaxAssetById, 
  adminUpdateRelaxAsset, 
  adminUploadMedia, 
  adminUploadThumbnail 
} from '../services/relaxService';

const EditRelaxAssetScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assetId = route.params?.assetId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'MUSIC',
    mediaUrl: '',
    thumbnailUrl: '',
    isPremium: false,
  });

  const types = [
    { value: 'MUSIC', label: 'Âm nhạc', icon: 'music' },
    { value: 'BREATHING', label: 'Bài tập thở', icon: 'lungs' },
    { value: 'MEDITATION', label: 'Thiền', icon: 'meditation' },
  ];

  useEffect(() => {
    loadAssetData();
  }, []);

  const loadAssetData = async () => {
    try {
      setInitialLoading(true);
      const response = await adminGetRelaxAssetById(assetId);
      
      if (response.success && response.data) {
        const asset = response.data;
        setFormData({
          title: asset.title,
          type: asset.type,
          mediaUrl: asset.mediaUrl,
          thumbnailUrl: asset.thumbnailUrl || '',
          isPremium: asset.isPremium,
        });
      }
    } catch (error) {
      console.error('Error loading asset:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin relax asset');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePickMedia = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'audio/*'],
      });

      if (result.canceled) return;

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        Alert.alert(
          'Xác nhận upload',
          `Bạn đã chọn: ${file.name}\nKích thước: ${(file.size! / 1024 / 1024).toFixed(2)} MB\n\nFile mới sẽ thay thế file hiện tại trên Cloudinary.`,
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Upload',
              onPress: async () => {
                await uploadMedia(file.uri, file.mimeType?.startsWith('video') ? 'video' : 'audio');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Lỗi', 'Không thể chọn file');
    }
  };

  const uploadMedia = async (uri: string, type: 'video' | 'audio') => {
    try {
      setUploadingMedia(true);
      const response = await adminUploadMedia(uri, type);
      
      if (response.success && response.data?.mediaUrl) {
        setFormData({ ...formData, mediaUrl: response.data.mediaUrl });
        Alert.alert('Thành công', 'Đã upload media mới lên Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Lỗi', 'Không thể upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handlePickThumbnail = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadThumbnail(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadThumbnail = async (uri: string) => {
    try {
      setUploadingThumbnail(true);
      const response = await adminUploadThumbnail(uri);
      
      if (response.success && response.data?.thumbnailUrl) {
        setFormData({ ...formData, thumbnailUrl: response.data.thumbnailUrl });
        Alert.alert('Thành công', 'Đã upload thumbnail mới lên Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      Alert.alert('Lỗi', 'Không thể upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.mediaUrl) {
      Alert.alert('Lỗi', 'Vui lòng upload media');
      return;
    }

    try {
      setLoading(true);
      const response = await adminUpdateRelaxAsset(assetId, {
        title: formData.title,
        type: formData.type,
        mediaUrl: formData.mediaUrl,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        isPremium: formData.isPremium,
      });

      if (response.success) {
        Alert.alert('Thành công', 'Đã cập nhật relax asset', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error updating relax asset:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật relax asset');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Đang tải...</Text>
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
        <Text style={styles.headerTitle}>Sửa Relax Asset</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <View style={styles.thumbnailSection}>
          <TouchableOpacity style={styles.thumbnailContainer} onPress={handlePickThumbnail} disabled={uploadingThumbnail}>
            {formData.thumbnailUrl ? (
              <Image source={{ uri: formData.thumbnailUrl }} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <MaterialCommunityIcons name="image-plus" size={48} color="#667EEA" />
                <Text style={styles.thumbnailText}>Thêm ảnh bìa</Text>
              </View>
            )}
            {uploadingThumbnail && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.thumbnailHint}>Tỷ lệ khuyến nghị: 16:9</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tiêu đề *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tiêu đề..."
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại *</Text>
            <View style={styles.typeContainer}>
              {types.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeChip,
                    formData.type === type.value && styles.typeChipSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.value })}
                >
                  <MaterialCommunityIcons
                    name={type.icon as any}
                    size={20}
                    color={formData.type === type.value ? '#FFF' : '#667EEA'}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      formData.type === type.value && styles.typeChipTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Media (Video/Audio) *</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickMedia}
              disabled={uploadingMedia}
            >
              {uploadingMedia ? (
                <ActivityIndicator color="#667EEA" />
              ) : (
                <>
                  <MaterialCommunityIcons name="cloud-upload" size={24} color="#667EEA" />
                  <Text style={styles.uploadButtonText}>
                    {formData.mediaUrl ? 'Thay đổi file media' : 'Chọn file media'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {formData.mediaUrl && (
              <Text style={styles.urlPreview} numberOfLines={1}>
                {formData.mediaUrl}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.label}>Premium</Text>
                <Text style={styles.hint}>Yêu cầu gói Premium để xem</Text>
              </View>
              <Switch
                value={formData.isPremium}
                onValueChange={(value) => setFormData({ ...formData, isPremium: value })}
                trackColor={{ false: '#E5E7EB', true: '#667EEA' }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (loading || uploadingMedia) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || uploadingMedia}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Cập nhật</Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  thumbnailSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 300,
    height: 169,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  thumbnailText: {
    marginTop: 8,
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  thumbnailHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  typeChipSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  typeChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  typeChipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667EEA',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  urlPreview: {
    marginTop: 8,
    fontSize: 12,
    color: '#10B981',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default EditRelaxAssetScreen;
