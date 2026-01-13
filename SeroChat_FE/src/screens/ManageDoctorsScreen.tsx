import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import doctorService from '../services/doctorService';

interface Doctor {
  doctorId: number;
  name: string;
  specialtyName: string;
  experienceYears?: number;
  phone?: string;
  imageUrl?: string;
  isActive: boolean;
  certificatesCount: number;
}

interface Specialty {
  specialtyId: number;
  specialtyName: string;
  doctorsCount: number;
  activeDoctorsCount: number;
}

const ManageDoctorsScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentPage, search, selectedSpecialty]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load doctors and specialties separately to handle errors independently
      const doctorsRes = await doctorService.adminGetDoctors(currentPage, 10, search || undefined);
      
      if (doctorsRes.success) {
        let filteredDoctors = doctorsRes.data;
        
        // Filter by specialty if selected
        if (selectedSpecialty) {
          filteredDoctors = filteredDoctors.filter(
            (d: Doctor) => d.specialtyName === specialties.find(s => s.specialtyId === selectedSpecialty)?.specialtyName
          );
        }

        setDoctors(filteredDoctors);
        setTotalPages(doctorsRes.pagination?.totalPages || 1);
        setTotalCount(doctorsRes.pagination?.totalCount || 0);
      }

      // Load specialties separately (don't fail if this fails)
      try {
        const specialtiesRes = await doctorService.adminGetSpecialties();
        if (specialtiesRes.success) {
          setSpecialties(specialtiesRes.data);
        }
      } catch (specError) {
        console.log('Error loading specialties:', specError);
        // Continue without specialties filter
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách bác sĩ');
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

  const handleToggleActive = async (doctorId: number) => {
    try {
      const response = await doctorService.adminToggleActive(doctorId);
      if (response.success) {
        Alert.alert('Thành công', response.message);
        loadData();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái bác sĩ');
    }
  };

  const handleDelete = (doctorId: number, doctorName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa bác sĩ "${doctorName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await doctorService.adminDeleteDoctor(doctorId);
              if (response.success) {
                Alert.alert('Thành công', 'Đã xóa bác sĩ');
                loadData();
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bác sĩ');
            }
          },
        },
      ]
    );
  };

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.doctorImage}
          />
        ) : (
          <View style={[styles.doctorImage, styles.doctorImagePlaceholder]}>
            <MaterialCommunityIcons name="doctor" size={32} color="#667EEA" />
          </View>
        )}
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialty}>
            <MaterialCommunityIcons name="medical-bag" size={14} color="#667EEA" />
            {' '}{item.specialtyName}
          </Text>
          {item.experienceYears && (
            <Text style={styles.doctorExperience}>
              <MaterialCommunityIcons name="school" size={14} color="#666" />
              {' '}{item.experienceYears} năm kinh nghiệm
            </Text>
          )}
          {item.phone && (
            <Text style={styles.doctorPhone}>
              <MaterialCommunityIcons name="phone" size={14} color="#666" />
              {' '}{item.phone}
            </Text>
          )}
        </View>
        <View style={styles.doctorStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.isActive ? '#10B981' : '#9CA3AF' },
            ]}
          >
            <Text style={styles.statusText}>
              {item.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.doctorActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('DoctorDetailAdmin', { doctorId: item.doctorId })}
        >
          <MaterialCommunityIcons name="eye" size={20} color="#667EEA" />
          <Text style={styles.actionButtonText}>Xem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditDoctor', { doctorId: item.doctorId })}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#F59E0B" />
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>

        {/* Toggle button disabled per user request */}
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleActive(item.doctorId)}
        >
          <MaterialCommunityIcons
            name={item.isActive ? 'pause-circle' : 'play-circle'}
            size={20}
            color={item.isActive ? '#EF4444' : '#10B981'}
          />
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Tắt' : 'Bật'}
          </Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.doctorId, item.name)}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
          <Text style={styles.actionButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lọc theo chuyên khoa</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.specialtyOption,
              selectedSpecialty === null && styles.specialtyOptionSelected,
            ]}
            onPress={() => {
              setSelectedSpecialty(null);
              setShowFilterModal(false);
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.specialtyOptionText,
                selectedSpecialty === null && styles.specialtyOptionTextSelected,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          {specialties.map((specialty) => (
            <TouchableOpacity
              key={specialty.specialtyId}
              style={[
                styles.specialtyOption,
                selectedSpecialty === specialty.specialtyId &&
                  styles.specialtyOptionSelected,
              ]}
              onPress={() => {
                setSelectedSpecialty(specialty.specialtyId);
                setShowFilterModal(false);
                setCurrentPage(1);
              }}
            >
              <Text
                style={[
                  styles.specialtyOptionText,
                  selectedSpecialty === specialty.specialtyId &&
                    styles.specialtyOptionTextSelected,
                ]}
              >
                {specialty.specialtyName}
              </Text>
              <Text style={styles.specialtyCount}>
                {specialty.activeDoctorsCount} bác sĩ
              </Text>
            </TouchableOpacity>
          ))}
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Bác sĩ</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddDoctor')}
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
            placeholder="Tìm theo tên hoặc SĐT..."
            value={search}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} color="#667EEA" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Tổng: <Text style={styles.statsNumber}>{totalCount}</Text> bác sĩ
        </Text>
        {selectedSpecialty && (
          <TouchableOpacity
            style={styles.clearFilter}
            onPress={() => {
              setSelectedSpecialty(null);
              setCurrentPage(1);
            }}
          >
            <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
            <MaterialCommunityIcons name="close-circle" size={16} color="#667EEA" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.doctorId.toString()}
        renderItem={renderDoctor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="doctor" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Chưa có bác sĩ nào</Text>
          </View>
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
            onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <MaterialCommunityIcons name="chevron-left" size={20} color="#667EEA" />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Trang {currentPage} / {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === totalPages && styles.pageButtonDisabled,
            ]}
            onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <MaterialCommunityIcons name="chevron-right" size={20} color="#667EEA" />
          </TouchableOpacity>
        </View>
      )}

      {renderFilterModal()}
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
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFF',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  statsNumber: {
    fontWeight: 'bold',
    color: '#667EEA',
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#667EEA',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  doctorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
  },
  doctorImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#667EEA',
  },
  doctorExperience: {
    fontSize: 12,
    color: '#666',
  },
  doctorPhone: {
    fontSize: 12,
    color: '#666',
  },
  doctorStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  doctorActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 20,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  specialtyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specialtyOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  specialtyOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  specialtyOptionTextSelected: {
    fontWeight: 'bold',
    color: '#667EEA',
  },
  specialtyCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default ManageDoctorsScreen;
