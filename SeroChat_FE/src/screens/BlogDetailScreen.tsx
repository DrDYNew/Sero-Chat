import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import { exploreService } from '../services/exploreService';
import blogService from '../services/blogService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface BlogDetail {
  blogId: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
  authorName: string;
  categoryName: string;
  categoryId: number;
  readTime: string;
}

const BlogDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { blogId } = route.params || {};
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  
  console.log('BlogDetailScreen mounted with blogId:', blogId);
  
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (blogId) {
      loadBlogDetail();
      if (user?.id) {
        checkIfSaved();
        markAsRead();
      }
    } else {
      console.error('No blogId provided');
      setIsLoading(false);
    }
  }, [blogId, user]);

  const loadBlogDetail = async () => {
    try {
      setIsLoading(true);
      console.log('Loading blog with ID:', blogId);
      const data = await exploreService.getBlogById(blogId);
      console.log('Blog data loaded:', data?.title);
      setBlog(data);
    } catch (error) {
      console.error('Error loading blog detail:', error);
      console.error('Error details:', JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user?.id) return;
    try {
      const response = await blogService.isBlogSaved(user.id, blogId);
      if (response.success) {
        setIsSaved(response.isSaved);
      }
    } catch (error) {
      console.log('Error checking if saved:', error);
    }
  };

  const markAsRead = async () => {
    if (!user?.id) return;
    try {
      await blogService.markAsRead(user.id, blogId);
      console.log('Marked as read');
    } catch (error) {
      console.log('Error marking as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hôm nay';
    if (diffDays === 2) return 'Hôm qua';
    if (diffDays <= 7) return `${diffDays - 1} ngày trước`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để lưu bài viết');
      return;
    }

    if (isSaving) return;

    try {
      setIsSaving(true);
      if (isSaved) {
        await blogService.unsaveBlog(user.id, blogId);
        setIsSaved(false);
        Alert.alert('Thành công', 'Đã bỏ lưu bài viết');
      } else {
        await blogService.saveBlog(user.id, blogId);
        setIsSaved(true);
        Alert.alert('Thành công', 'Đã lưu bài viết');
      }
    } catch (error: any) {
      console.error('Error saving blog:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu bài viết');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!blog) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Không tìm thấy bài viết</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chi tiết bài viết</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <MaterialCommunityIcons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isSaved ? colors.primary : colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        {blog.thumbnailUrl ? (
          <Image source={{ uri: blog.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.thumbnail}
          >
            <MaterialCommunityIcons name="book-open-variant" size={64} color="#FFF" />
          </LinearGradient>
        )}

        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4FF' }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>{blog.categoryName}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{blog.title}</Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-circle" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{blog.authorName}</Text>
          </View>
          <View style={[styles.metaDivider, { backgroundColor: isDarkMode ? '#334155' : '#E5E7EB' }]} />
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{blog.readTime}</Text>
          </View>
          <View style={[styles.metaDivider, { backgroundColor: isDarkMode ? '#334155' : '#E5E7EB' }]} />
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{formatDate(blog.createdAt)}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: blog.content }}
            tagsStyles={{
              body: {
                color: colors.text,
                fontSize: 16,
                lineHeight: 26,
              },
              h2: {
                color: colors.text,
                fontSize: 22,
                fontWeight: 'bold',
                marginTop: 24,
                marginBottom: 12,
              },
              h3: {
                color: colors.text,
                fontSize: 18,
                fontWeight: '600',
                marginTop: 20,
                marginBottom: 10,
              },
              p: {
                marginBottom: 16,
                lineHeight: 26,
              },
              ul: {
                marginBottom: 16,
              },
              ol: {
                marginBottom: 16,
              },
              li: {
                marginBottom: 8,
              },
              strong: {
                fontWeight: '700',
                color: '#1F2937',
              },
            }}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#667EEA" />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="heart-outline" size={20} color="#667EEA" />
            <Text style={styles.actionText}>Yêu thích</Text>
          </TouchableOpacity>
        </View>

        {/* Related Articles */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Bài viết liên quan</Text>
          <Text style={styles.relatedSubtitle}>Khám phá thêm các bài viết về {blog.categoryName}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 220,
    left: 20,
    backgroundColor: '#667EEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginTop: 24,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
    marginTop: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#667EEA',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
    marginLeft: 8,
  },
  relatedSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  relatedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default BlogDetailScreen;
