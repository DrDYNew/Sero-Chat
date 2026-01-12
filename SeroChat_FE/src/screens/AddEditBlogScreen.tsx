import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import blogService, { BlogCategory, CreateBlogRequest, UpdateBlogRequest } from '../services/blogService';

const AddEditBlogScreen = ({ route, navigation }: any) => {
  const { blogId } = route.params || {};
  const isEditMode = !!blogId;
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [formData, setFormData] = useState({
    blogCatId: 0,
    title: '',
    content: '',
    thumbnailUrl: '',
    authorName: user?.fullName || user?.email || '',
  });

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadBlogData();
    }
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh để chọn hình ảnh');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await blogService.getBlogCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        if (!isEditMode && response.data.length > 0) {
          setFormData(prev => ({ ...prev, blogCatId: response.data[0].blogCatId }));
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh mục');
    }
  };

  const loadBlogData = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogById(blogId);
      if (response.success && response.data) {
        const blog = response.data;
        setFormData({
          blogCatId: blog.blogCatId,
          title: blog.title,
          content: blog.content,
          thumbnailUrl: blog.thumbnailUrl || '',
          authorName: blog.authorName || user?.fullName || user?.email || '',
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin blog');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, thumbnailUrl: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Cần cấp quyền truy cập camera để chụp ảnh');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, thumbnailUrl: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Chọn hình ảnh',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Thư viện', onPress: pickImage },
        { text: 'Chụp ảnh', onPress: takePhoto },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
      return;
    }
    if (formData.blogCatId === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (isEditMode) {
        const updateData: UpdateBlogRequest = {
          blogCatId: formData.blogCatId,
          title: formData.title,
          content: formData.content,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          authorName: formData.authorName || undefined,
        };
        response = await blogService.updateBlog(blogId, updateData);
      } else {
        const createData: CreateBlogRequest = {
          blogCatId: formData.blogCatId,
          title: formData.title,
          content: formData.content,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          authorName: user?.fullName || user?.email || 'Admin',
        };
        response = await blogService.createBlog(createData);
      }

      if (response.success) {
        Alert.alert('Thành công', isEditMode ? 'Cập nhật blog thành công' : 'Tạo blog thành công');
        navigation.goBack();
      } else {
        Alert.alert('Lỗi', response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditMode ? 'Sửa Blog' : 'Thêm Blog'}</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Danh mục *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.blogCatId}
              onValueChange={(value) => setFormData({ ...formData, blogCatId: value })}
              style={styles.picker}
            >
              <Picker.Item label="Chọn danh mục" value={0} />
              {categories.map((cat) => (
                <Picker.Item key={cat.blogCatId} label={cat.categoryName} value={cat.blogCatId} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tiêu đề *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề blog"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nội dung *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập nội dung blog"
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Hình ảnh</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={showImagePickerOptions}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.imagePickerGradient}>
              <MaterialCommunityIcons name="image-plus" size={22} color="#fff" />
              <Text style={styles.imagePickerButtonText}>
                {formData.thumbnailUrl ? 'Thay đổi hình ảnh' : 'Chọn hình ảnh'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {formData.thumbnailUrl && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: formData.thumbnailUrl }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setFormData({ ...formData, thumbnailUrl: '' })}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color="#f44336" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tác giả</Text>
          <View style={styles.authorDisplay}>
            <MaterialCommunityIcons name="account-edit" size={20} color="#667eea" />
            <Text style={styles.authorText}>{user?.fullName || user?.email || 'Admin'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.saveButtonGradient}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Lưu</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    elevation: 2,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePickerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginTop: 15,
    position: 'relative',
    alignSelf: 'center',
  },
  imagePreview: {
    width: 250,
    height: 140,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
  },
  authorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  authorText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default AddEditBlogScreen;
