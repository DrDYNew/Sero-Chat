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
  RefreshControl,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminGetRelaxAssets, adminDeleteRelaxAsset, getAssetTypeLabel } from '../services/relaxService';

interface RelaxAsset {
  assetId: number;
  title: string;
  type?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  isPremium?: boolean;
  createdAt?: string;
}

const ManageRelaxScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assets, setAssets] = useState<RelaxAsset[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const types = [
    { value: '', label: 'Tất cả' },
    { value: 'MUSIC', label: 'Âm nhạc' },
    { value: 'BREATHING', label: 'Bài tập thở' },
    { value: 'MEDITATION', label: 'Thiền' },
  ];

  useEffect(() => {
    loadData();
  }, [currentPage, search, selectedType]);

  const loadData = async () => {
    try {
      const response = await adminGetRelaxAssets(
        currentPage,
        10,
        search || undefined,
        selectedType || undefined
      );

      if (response.success) {
        setAssets(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error loading relax assets:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách relax assets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadData();
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setCurrentPage(1);
  };

  const handleDelete = (assetId: number, title: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminDeleteRelaxAsset(assetId);
              if (response.success) {
                Alert.alert('Thành công', 'Đã xóa relax asset');
                loadData();
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa relax asset');
            }
          },
        },
      ]
    );
  };

  const renderAsset = ({ item }: { item: RelaxAsset }) => (
    <View style={styles.assetCard}>
      <View style={styles.assetHeader}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <MaterialCommunityIcons
              name={item.type === 'MUSIC' ? 'music' : item.type === 'BREATHING' ? 'lungs' : 'meditation'}
              size={32}
              color="#667EEA"
            />
          </View>
        )}
        <View style={styles.assetInfo}>
          <Text style={styles.assetTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.type && (
            <Text style={styles.assetType}>
              <MaterialCommunityIcons name="tag" size={14} color="#667EEA" />
              {' '}{getAssetTypeLabel(item.type)}
            </Text>
          )}
          {item.createdAt && (
            <Text style={styles.assetDate}>
              <MaterialCommunityIcons name="calendar" size={14} color="#666" />
              {' '}{new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          )}
        </View>
        <View style={styles.assetStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.isPremium ? '#F59E0B' : '#10B981' },
            ]}
          >
            <MaterialCommunityIcons
              name={item.isPremium ? 'crown' : 'check-circle'}
              size={14}
              color="#FFF"
            />
            <Text style={styles.statusText}>
              {item.isPremium ? 'Premium' : 'Free'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.assetActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('RelaxDetailAdmin', { assetId: item.assetId })}
        >
          <MaterialCommunityIcons name="eye" size={20} color="#667EEA" />
          <Text style={styles.actionButtonText}>Xem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditRelaxAsset', { assetId: item.assetId })}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#F59E0B" />
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.assetId, item.title)}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
          <Text style={styles.actionButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lọc theo loại</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {types.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeOption,
                  selectedType === type.value && styles.typeOptionSelected,
                ]}
                onPress={() => {
                  setSelectedType(type.value);
                  setCurrentPage(1);
                  setFilterModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    selectedType === type.value && styles.typeOptionTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
                {selectedType === type.value && (
                  <MaterialCommunityIcons name="check" size={20} color="#667EEA" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
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
        <Text style={styles.headerTitle}>Quản lý Relax</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddRelaxAsset')}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tiêu đề..."
            value={search}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} color="#667EEA" />
          {selectedType && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Tổng số: {totalCount} {selectedType && `(${getAssetTypeLabel(selectedType)})`}
        </Text>
        {selectedType && (
          <TouchableOpacity onPress={() => { setSelectedType(''); setCurrentPage(1); }}>
            <Text style={styles.clearFilter}>Xóa lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {assets.map((item) => (
          <View key={item.assetId}>{renderAsset({ item })}</View>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={currentPage === 1 ? '#CCC' : '#667EEA'}
              />
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              Trang {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={currentPage === totalPages ? '#CCC' : '#667EEA'}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <FilterModal />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  clearFilter: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  assetCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  assetHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  assetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  assetType: {
    fontSize: 13,
    color: '#667EEA',
    marginBottom: 4,
  },
  assetDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  assetStatus: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  assetActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  typeOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#667EEA',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  typeOptionTextSelected: {
    color: '#667EEA',
    fontWeight: '600',
  },
});

export default ManageRelaxScreen;
