import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import blogService, { BlogListItem } from '../services/blogService';
import { useTheme } from '../contexts/ThemeContext';

const SavedBlogsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavedBlogs();
  }, []);

  const loadSavedBlogs = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await blogService.getSavedBlogs(parseInt(user.id));
      if (response.success) {
        setBlogs(response.data || []);
      }
    } catch (error) {
      console.error('Error loading saved blogs:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách blog đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedBlogs();
    setRefreshing(false);
  };

  const handleUnsaveBlog = async (blogId: number) => {
    if (!user?.id) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn bỏ lưu blog này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bỏ lưu',
          style: 'destructive',
          onPress: async () => {
            try {
              await blogService.unsaveBlog(parseInt(user?.id || '0'), blogId);
              setBlogs(blogs.filter(blog => blog.blogId !== blogId));
              Alert.alert('Thành công', 'Đã bỏ lưu blog');
            } catch (error) {
              console.error('Error unsaving blog:', error);
              Alert.alert('Lỗi', 'Không thể bỏ lưu blog');
            }
          },
        },
      ]
    );
  };

  const handleBlogPress = async (blogId: number) => {
    if (user?.id) {
      // Đánh dấu đã đọc
      try {
        await blogService.markAsRead(parseInt(user.id), blogId);
      } catch (error) {
        console.log('Error marking as read:', error);
      }
    }
    navigation.navigate('BlogDetail', { blogId });
  };

  const renderBlogItem = ({ item }: { item: BlogListItem }) => (
    <TouchableOpacity
      style={[styles.blogCard, { backgroundColor: colors.card }]}
      onPress={() => handleBlogPress(item.blogId)}
      activeOpacity={0.7}
    >
      {item.thumbnailUrl && (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      )}
      <View style={styles.blogContent}>
        <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4FF' }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category?.categoryName}</Text>
        </View>
        <Text style={[styles.blogTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.blogMeta}>
          <MaterialCommunityIcons name="account-circle" size={16} color={colors.textSecondary} />
          <Text style={[styles.authorName, { color: colors.textSecondary }]}>{item.authorName || 'Ẩn danh'}</Text>
          <Text style={[styles.separator, { color: colors.textSecondary }]}>•</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.unsaveButton}
        onPress={() => handleUnsaveBlog(item.blogId)}
      >
        <MaterialCommunityIcons name="bookmark" size={24} color="#EC4899" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="bookmark-outline" size={80} color={isDarkMode ? '#334155' : '#ccc'} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có blog đã lưu</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Lưu các bài viết yêu thích để đọc sau
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Explore')}
      >
        <Text style={styles.exploreButtonText}>Khám phá blog</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? '#334155' : '#e0e0e0' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Blog đã lưu</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Blog đã lưu</Text>
        <TouchableOpacity onPress={loadSavedBlogs}>
          <MaterialCommunityIcons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={blogs}
        renderItem={renderBlogItem}
        keyExtractor={(item) => item.blogId.toString()}
        contentContainerStyle={blogs.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  blogCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  thumbnail: {
    width: 100,
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  blogContent: {
    flex: 1,
    padding: 12,
  },
  categoryBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  blogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  separator: {
    marginHorizontal: 6,
    color: '#999',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  unsaveButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SavedBlogsScreen;
