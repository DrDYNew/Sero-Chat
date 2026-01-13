import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { exploreService, Blog, BlogCategory } from '../services/exploreService';
import blogService from '../services/blogService';
import { useAuth } from '../contexts/AuthContext';
import BottomTabBar from '../components/BottomTabBar';

const ExploreScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [blogsData, categoriesData] = await Promise.all([
        exploreService.getAllBlogs(selectedCategory || undefined),
        categories.length === 0 ? exploreService.getBlogCategories() : Promise.resolve(categories),
      ]);
      setBlogs(blogsData);
      if (categories.length === 0) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading explore data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleCategoryPress = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return `${Math.floor(diffInDays / 30)} tháng trước`;
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      <TouchableOpacity
        style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
        onPress={() => handleCategoryPress(null)}
      >
        <Text style={[styles.categoryText, selectedCategory === null && styles.categoryTextActive]}>
          Tất cả
        </Text>
      </TouchableOpacity>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.categoryId}
          style={[
            styles.categoryChip,
            selectedCategory === category.categoryId && styles.categoryChipActive,
          ]}
          onPress={() => handleCategoryPress(category.categoryId)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.categoryId && styles.categoryTextActive,
            ]}
          >
            {category.categoryName}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBlogCard = ({ item }: { item: Blog }) => {
    const handleBlogPress = async () => {
      // Đánh dấu đã đọc nếu user đã đăng nhập
      if (user?.id) {
        try {
          await blogService.markAsRead(user.id, item.blogId);
        } catch (error) {
          console.log('Error marking as read:', error);
        }
      }
      navigation.navigate('BlogDetail', { blogId: item.blogId });
    };

    return (
      <TouchableOpacity
        style={styles.blogCard}
        onPress={handleBlogPress}
        activeOpacity={0.7}
      >
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.blogImage} />
      ) : (
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blogImagePlaceholder}
        >
          <MaterialCommunityIcons name="book-open-page-variant" size={40} color="#FFF" />
        </LinearGradient>
      )}
      
      <View style={styles.blogContent}>
        <View style={styles.blogMeta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.categoryName}</Text>
          </View>
          <Text style={styles.blogDate}>{formatDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.blogTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.blogSummary} numberOfLines={3}>
          {item.summary}
        </Text>

        <View style={styles.blogFooter}>
          <View style={styles.readTimeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#999" />
            <Text style={styles.readTime}>{item.readTime}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#667EEA" />
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Khám phá</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
        <BottomTabBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khám phá</Text>
        <Text style={styles.headerSubtitle}>
          {blogs.length} bài viết về sức khỏe tâm lý
        </Text>
      </View>

      <FlatList
        data={blogs}
        renderItem={renderBlogCard}
        keyExtractor={(item) => item.blogId.toString()}
        ListHeaderComponent={renderCategoryFilter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#667EEA']}
            tintColor="#667EEA"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="book-open-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
          </View>
        }
      />

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  blogCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  blogImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  blogImagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogContent: {
    padding: 16,
  },
  blogMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3F4FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667EEA',
  },
  blogDate: {
    fontSize: 12,
    color: '#999',
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  blogSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTime: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ExploreScreen;
