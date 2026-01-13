import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import doctorService, { Doctor, Specialty } from '../services/doctorService';

const DoctorListScreen = ({ navigation }: any) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedSpecialty]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, specialtiesRes] = await Promise.all([
        doctorService.getAllDoctors(selectedSpecialty || undefined),
        specialties.length === 0 ? doctorService.getSpecialties() : Promise.resolve({ data: specialties, success: true }),
      ]);

      if (doctorsRes.success) {
        setDoctors(doctorsRes.data);
      }
      if (specialtiesRes.success && specialties.length === 0) {
        setSpecialties(specialtiesRes.data);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderSpecialtyFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.specialtiesContainer}
    >
      <TouchableOpacity
        style={[styles.specialtyChip, selectedSpecialty === null && styles.specialtyChipActive]}
        onPress={() => setSelectedSpecialty(null)}
      >
        <Text style={[styles.specialtyText, selectedSpecialty === null && styles.specialtyTextActive]}>
          Tất cả
        </Text>
      </TouchableOpacity>
      {specialties.map((specialty) => (
        <TouchableOpacity
          key={specialty.specialtyId}
          style={[
            styles.specialtyChip,
            selectedSpecialty === specialty.specialtyId && styles.specialtyChipActive,
          ]}
          onPress={() => setSelectedSpecialty(specialty.specialtyId)}
        >
          <Text
            style={[
              styles.specialtyText,
              selectedSpecialty === specialty.specialtyId && styles.specialtyTextActive,
            ]}
          >
            {specialty.specialtyName}
          </Text>
          {specialty.doctorCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{specialty.doctorCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.doctorId })}
      activeOpacity={0.7}
    >
      <View style={styles.doctorImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.doctorImage} />
        ) : (
          <View style={styles.doctorImagePlaceholder}>
            <MaterialCommunityIcons name="doctor" size={40} color="#14B8A6" />
          </View>
        )}
        {item.certificateCount > 0 && (
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={20} color="#14B8A6" />
          </View>
        )}
      </View>

      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        
        <View style={styles.specialtyBadge}>
          <MaterialCommunityIcons name="stethoscope" size={14} color="#14B8A6" />
          <Text style={styles.specialtyBadgeText}>{item.specialtyName}</Text>
        </View>

        {item.experienceYears && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="briefcase-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.experienceYears} năm kinh nghiệm</Text>
          </View>
        )}

        {item.address && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
          </View>
        )}

        <View style={styles.contactButtons}>
          {item.phone && (
            <TouchableOpacity style={styles.contactButton}>
              <MaterialCommunityIcons name="phone" size={18} color="#14B8A6" />
              <Text style={styles.contactButtonText}>Gọi</Text>
            </TouchableOpacity>
          )}
          {item.zaloUrl && (
            <TouchableOpacity style={styles.contactButton}>
              <MaterialCommunityIcons name="message-text" size={18} color="#14B8A6" />
              <Text style={styles.contactButtonText}>Zalo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="doctor" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có bác sĩ</Text>
      <Text style={styles.emptyText}>
        {selectedSpecialty 
          ? 'Không tìm thấy bác sĩ trong chuyên khoa này'
          : 'Hiện chưa có bác sĩ nào trong hệ thống'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm chuyên gia</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm chuyên gia</Text>
        <TouchableOpacity onPress={loadData}>
          <MaterialCommunityIcons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <MaterialCommunityIcons name="account-group" size={20} color="#14B8A6" />
        <Text style={styles.statsText}>
          {doctors.length} bác sĩ tâm lý chuyên nghiệp
        </Text>
      </View>

      <FlatList
        data={doctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.doctorId.toString()}
        ListHeaderComponent={renderSpecialtyFilter}
        contentContainerStyle={doctors.length === 0 ? styles.emptyList : styles.list}
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
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#E6F7F5',
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },
  specialtiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    gap: 6,
  },
  specialtyChipActive: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  specialtyTextActive: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
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
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorImageContainer: {
    position: 'relative',
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  doctorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F7F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  doctorName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  specialtyBadgeText: {
    fontSize: 12,
    color: '#14B8A6',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  contactButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  contactButtonText: {
    fontSize: 12,
    color: '#14B8A6',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
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
  },
});

export default DoctorListScreen;
