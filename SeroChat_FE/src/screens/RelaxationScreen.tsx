import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as relaxService from '../services/relaxService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const RelaxationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'MUSIC' | 'BREATHING' | 'MEDITATION'>('all');
  const [assets, setAssets] = useState<relaxService.RelaxAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'Tất cả', icon: 'apps' },
    { id: 'BREATHING', label: 'Thở sâu', icon: 'lungs' },
    { id: 'MEDITATION', label: 'Thiền', icon: 'yoga' },
    { id: 'MUSIC', label: 'Âm nhạc', icon: 'music-note' },
  ];

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await relaxService.getRelaxAssets();
      if (response.success) {
        setAssets(response.data);
      }
    } catch (error) {
      console.error('Error loading relax assets:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thư giãn');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = selectedCategory === 'all'
    ? assets
    : assets.filter(asset => asset.type === selectedCategory);

  const getGradientForType = (type: string): [string, string] => {
    switch (type) {
      case 'MUSIC':
        return ['#667EEA', '#764BA2'];
      case 'BREATHING':
        return ['#F857A6', '#FF5858'];
      case 'MEDITATION':
        return ['#56CCF2', '#2F80ED'];
      default:
        return ['#43E97B', '#38F9D7'];
    }
  };

  const getDurationByType = (type: string): string => {
    switch (type) {
      case 'MUSIC':
        return '20-30 phút';
      case 'BREATHING':
        return '3-5 phút';
      case 'MEDITATION':
        return '10-15 phút';
      default:
        return '5-10 phút';
    }
  };

  const handleActivityPress = (asset: relaxService.RelaxAsset) => {
    // Check if premium content and user doesn't have subscription
    if (asset.isPremium && !relaxService.canAccessPremiumContent(user?.subscriptionStatus)) {
      Alert.alert(
        '🔒 Nội dung Premium',
        'Bạn cần đăng ký gói Premium để truy cập nội dung này.',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xem gói Premium',
            onPress: () => navigation.navigate('SubscriptionPlans' as never),
          },
        ]
      );
      return;
    }

    // Navigate to player screen
    navigation.navigate('RelaxPlayer' as never, { asset } as never);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thư giãn & Thiền</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Description */}
        <View style={[styles.descriptionCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="spa" size={48} color={colors.primary} />
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>
            Dành thời gian cho bản thân
          </Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            Khám phá các bài tập thở, thiền và âm thanh để giúp bạn thư giãn, giảm căng thẳng và cải thiện giấc ngủ.
          </Text>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4FF', borderColor: isDarkMode ? '#334155' : '#E5E7EB' },
                selectedCategory === category.id && [styles.categoryChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
              ]}
              onPress={() => setSelectedCategory(category.id as any)}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? '#FFF' : colors.primary}
              />
              <Text
                style={[
                  styles.categoryLabel,
                  { color: selectedCategory === category.id ? '#FFF' : colors.primary },
                  selectedCategory === category.id && styles.categoryLabelActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activities Grid */}
        <View style={styles.activitiesGrid}>
          {filteredAssets.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="spa-outline" size={64} color={isDarkMode ? '#334155' : '#D1D5DB'} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Chưa có nội dung</Text>
            </View>
          ) : (
            filteredAssets.map((asset) => (
              <TouchableOpacity
                key={asset.assetId}
                style={styles.activityCard}
                onPress={() => handleActivityPress(asset)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={getGradientForType(asset.type)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activityGradient}
                >
                  {/* Premium Badge */}
                  {asset.isPremium && (
                    <View style={styles.premiumBadge}>
                      <MaterialCommunityIcons name="crown" size={14} color="#FFD700" />
                      <Text style={styles.premiumText}>Premium</Text>
                    </View>
                  )}

                  <View style={styles.activityIconContainer}>
                    <MaterialCommunityIcons
                      name={relaxService.getAssetTypeIcon(asset.type) as any}
                      size={32}
                      color="#FFF"
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{asset.title}</Text>
                    <Text style={styles.activityDescription}>
                      {relaxService.getAssetTypeLabel(asset.type)}
                    </Text>
                    <View style={styles.activityDuration}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color="#FFF"
                      />
                      <Text style={styles.activityDurationText}>
                        {getDurationByType(asset.type)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
          <View style={styles.tipsHeader}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#F59E0B" />
            <Text style={[styles.tipsTitle, { color: colors.text }]}>Mẹo nhỏ</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Tìm không gian yên tĩnh, thoải mái
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Sử dụng tai nghe để trải nghiệm tốt hơn
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Thực hành đều đặn mỗi ngày 5-10 phút
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Nội dung Premium cần đăng ký gói để truy cập
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  descriptionCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#667EEA',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },
  categoryLabelActive: {
    color: '#FFF',
  },
  activitiesGrid: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityGradient: {
    padding: 20,
    minHeight: 140,
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
  activityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
  },
  activityDescription: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 10,
    lineHeight: 18,
  },
  activityDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityDurationText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default RelaxationScreen;
