import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import blogService, { BlogDetail } from '../services/blogService';

const AdminBlogDetailScreen = ({ route, navigation }: any) => {
  const { blogId } = route.params;
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogDetail();
  }, [blogId]);

  const loadBlogDetail = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogById(blogId);
      if (response.success && response.data) {
        setBlog(response.data);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin blog');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin blog');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('AddEditBlog', { blogId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa blog này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await blogService.deleteBlog(blogId);
              if (response.success) {
                Alert.alert('Thành công', 'Xóa blog thành công');
                navigation.goBack();
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể xóa blog');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa blog');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết Blog</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {blog.thumbnailUrl && (
          <Image source={{ uri: blog.thumbnailUrl }} style={styles.thumbnail} />
        )}

        <View style={styles.detailCard}>
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="tag" size={16} color="#1976d2" />
            <Text style={styles.categoryText}>{blog.category.categoryName}</Text>
          </View>

          <Text style={styles.title}>{blog.title}</Text>

          <View style={styles.metaContainer}>
            {blog.authorName && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="account-edit" size={18} color="#666" />
                <Text style={styles.metaText}>Tác giả: {blog.authorName}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar" size={18} color="#666" />
              <Text style={styles.metaText}>
                {new Date(blog.createdAt).toLocaleString('vi-VN')}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.contentText}>{blog.content}</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.actionButtonGradient}>
              <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <LinearGradient colors={['#f44336', '#d32f2f']} style={styles.actionButtonGradient}>
              <MaterialCommunityIcons name="delete" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Xóa</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  detailCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '600',
    marginLeft: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    lineHeight: 32,
  },
  metaContainer: {
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  contentText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 30,
    gap: 15,
  },
  editButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  actionButtonText: {
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
});

export default AdminBlogDetailScreen;
