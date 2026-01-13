import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { adminGetRelaxAssetById, adminDeleteRelaxAsset } from '../services/relaxService';

const RelaxDetailAdminScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assetId = route.params?.assetId;

  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<any>(null);

  useEffect(() => {
    loadAssetDetail();
  }, []);

  const loadAssetDetail = async () => {
    try {
      setLoading(true);
      const response = await adminGetRelaxAssetById(assetId);
      
      if (response.success && response.data) {
        setAsset(response.data);
      }
    } catch (error) {
      console.error('Error loading asset detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin relax asset');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditRelaxAsset', { assetId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa relax asset này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminDeleteRelaxAsset(assetId);
              if (response.success) {
                Alert.alert('Thành công', 'Đã xóa relax asset', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              }
            } catch (error) {
              console.error('Error deleting asset:', error);
              Alert.alert('Lỗi', 'Không thể xóa relax asset');
            }
          },
        },
      ]
    );
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      MUSIC: 'Âm nhạc',
      BREATHING: 'Bài tập thở',
      MEDITATION: 'Thiền',
    };
    return types[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      MUSIC: 'music',
      BREATHING: 'lungs',
      MEDITATION: 'meditation',
    };
    return icons[type] || 'music';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!asset) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy relax asset</Text>
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
        <Text style={styles.headerTitle}>Chi tiết Relax Asset</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <MaterialCommunityIcons name="pencil" size={22} color="#667EEA" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        {asset.thumbnailUrl && (
          <View style={styles.thumbnailSection}>
            <Image source={{ uri: asset.thumbnailUrl }} style={styles.thumbnail} />
          </View>
        )}

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{asset.title}</Text>
            {asset.isPremium && (
              <View style={styles.premiumBadge}>
                <MaterialCommunityIcons name="crown" size={14} color="#F59E0B" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <MaterialCommunityIcons name="shape" size={20} color="#667EEA" />
              <Text style={styles.infoLabelText}>Loại</Text>
            </View>
            <View style={styles.typeChip}>
              <MaterialCommunityIcons 
                name={getTypeIcon(asset.type) as any} 
                size={16} 
                color="#667EEA" 
              />
              <Text style={styles.typeText}>{getTypeLabel(asset.type)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <MaterialCommunityIcons name="play-circle" size={20} color="#667EEA" />
              <Text style={styles.infoLabelText}>Media URL</Text>
            </View>
          </View>
          <View style={styles.urlContainer}>
            <Text style={styles.urlText} numberOfLines={2}>
              {asset.mediaUrl}
            </Text>
            <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <MaterialCommunityIcons name="calendar" size={20} color="#667EEA" />
              <Text style={styles.infoLabelText}>Ngày tạo</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(asset.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <MaterialCommunityIcons name="update" size={20} color="#667EEA" />
              <Text style={styles.infoLabelText}>Cập nhật</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(asset.updatedAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <MaterialCommunityIcons name="pencil" size={24} color="#667EEA" />
            <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <MaterialCommunityIcons name="delete" size={24} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.deleteText]}>Xóa</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: '#EF4444',
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
  editButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  thumbnailSection: {
    backgroundColor: '#000',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabelText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  typeText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  actionsCard: {
    backgroundColor: '#FFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  deleteText: {
    color: '#EF4444',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
});

export default RelaxDetailAdminScreen;
