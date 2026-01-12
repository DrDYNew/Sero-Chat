import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, RefreshControl, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import blogService, { BlogListItem, BlogCategory } from '../services/blogService';

const ManageBlogsScreen = ({ navigation }: any) => {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getAllBlogs(page, 20, search, selectedCategory);
      if (response.success && response.data) {
        setBlogs(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách blog');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await blogService.getBlogCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.log('Error loading categories');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBlogs();
      loadCategories();
    }, [page, search, selectedCategory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBlogs();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setPage(1);
  };

  const handleCategoryFilter = (categoryId?: number) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleEdit = (blogId: number) => {
    navigation.navigate('AddEditBlog', { blogId });
  };

  const handleDelete = (blogId: number) => {
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
                loadBlogs();
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

  const handleViewDetail = (blogId: number) => {
    navigation.navigate('AdminBlogDetail', { blogId });
  };

  const renderBlog = ({ item }: { item: BlogListItem }) => (
    <View style={styles.blogCard}>
      <TouchableOpacity onPress={() => handleViewDetail(item.blogId)}>
        <View style={styles.blogContent}>
          {item.thumbnailUrl ? (
            <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <MaterialCommunityIcons name="image-outline" size={30} color="#aaa" />
            </View>
          )}
          <View style={styles.blogInfo}>
            <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category.categoryName}</Text>
            </View>
            <Text style={styles.blogMeta}>
              {item.authorName && `Tác giả: ${item.authorName} • `}
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}
          onPress={() => handleEdit(item.blogId)}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#f44336' }]}
          onPress={() => handleDelete(item.blogId)}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Blog</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddEditBlog')}>
            <MaterialCommunityIcons name="plus-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory === undefined && styles.filterChipActive]}
          onPress={() => handleCategoryFilter(undefined)}
        >
          <Text style={[styles.filterChipText, selectedCategory === undefined && styles.filterChipTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.blogCatId}
            style={[styles.filterChip, selectedCategory === cat.blogCatId && styles.filterChipActive]}
            onPress={() => handleCategoryFilter(cat.blogCatId)}
          >
            <Text style={[styles.filterChipText, selectedCategory === cat.blogCatId && styles.filterChipTextActive]}>
              {cat.categoryName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : blogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="text-box-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có blog nào</Text>
        </View>
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderBlog}
          keyExtractor={(item) => item.blogId.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
          }
        />
      )}

      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationBtn, page === 1 && styles.paginationBtnDisabled]}
            onPress={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={page === 1 ? '#ccc' : '#667eea'} />
          </TouchableOpacity>
          <Text style={styles.paginationText}>
            Trang {page} / {totalPages}
          </Text>
          <TouchableOpacity
            style={[styles.paginationBtn, page === totalPages && styles.paginationBtnDisabled]}
            onPress={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={page === totalPages ? '#ccc' : '#667eea'} />
          </TouchableOpacity>
        </View>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 8,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  blogCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  blogContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderThumbnail: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogInfo: {
    flex: 1,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  blogMeta: {
    fontSize: 12,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paginationBtn: {
    padding: 5,
  },
  paginationBtnDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});

export default ManageBlogsScreen;
