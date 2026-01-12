import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import BottomTabBar from '../components/BottomTabBar';
import { LinearGradient } from 'expo-linear-gradient';
import { moodService } from '../services/moodService';
import {
  getDailyAffirmation,
  getRelaxAssets,
  getFeaturedBlogs,
  getRecentActivities,
  DailyAffirmation,
  RelaxAsset,
  Blog,
  Activity,
} from '../services/homeService';

interface QuickStartTopic {
  id: number;
  title: string;
  icon: string;
  color: string;
  gradient: [string, string];
}

interface QuickTip {
  id: number;
  text: string;
  icon: string;
}

interface SelfCareItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface MoodStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // State for API data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<DailyAffirmation | null>(null);
  const [moodData, setMoodData] = useState<any>(null);
  const [relaxAssets, setRelaxAssets] = useState<RelaxAsset[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);

  // Fetch data from API
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const userId = user?.id;
      
      // Fetch public data available for all users (logged in or guest)
      const [quoteData, blogsData] = await Promise.all([
        getDailyAffirmation().catch(() => null),
        getFeaturedBlogs().catch(() => []),
      ]);

      if (quoteData) setDailyQuote(quoteData);
      setFeaturedBlogs(blogsData);

      // Fetch personalized data only for logged-in users
      if (!userId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch personalized data in parallel
      const [moodStats, assets, activities] = await Promise.all([
        moodService.getMoodStats().catch(() => null),
        getRelaxAssets().catch(() => []),
        getRecentActivities(Number(userId), 5).catch(() => []),
      ]);

      if (moodStats?.success && moodStats.data) {
        setMoodData(moodStats.data);
      }
      setRelaxAssets(assets);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  // Get mood label from score
  const getMoodLabel = (score?: number) => {
    if (!score) return 'Chưa có';
    if (score === 5) return 'Rất tốt';
    if (score === 4) return 'Tốt';
    if (score === 3) return 'Bình thường';
    if (score === 2) return 'Không tốt';
    return 'Rất tệ';
  };

  // Get mood color from score
  const getMoodColor = (score?: number) => {
    if (!score) return '#999';
    if (score === 5) return '#10B981';
    if (score === 4) return '#3B82F6';
    if (score === 3) return '#F59E0B';
    if (score === 2) return '#EF4444';
    return '#991B1B';
  };

  // Hardcoded quick tips
  const quickTips: QuickTip[] = [
    {
      id: 1,
      text: 'Hít thở sâu 3 lần khi cảm thấy lo lắng',
      icon: 'lightbulb',
    },
    {
      id: 2,
      text: 'Viết nhật ký cảm xúc mỗi tối giúp bạn hiểu bản thân hơn',
      icon: 'pencil',
    },
    {
      id: 3,
      text: 'Nói chuyện với ai đó là bước đầu tiên để được giúp đỡ',
      icon: 'chat',
    },
  ];

  // Hardcoded quick start topics
  const quickStartTopics: QuickStartTopic[] = [
    {
      id: 1,
      title: 'Áp lực học tập/thi cử',
      icon: 'book-open-page-variant',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF8E53'],
    },
    {
      id: 2,
      title: 'Stress công việc',
      icon: 'briefcase-outline',
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
    },
    {
      id: 3,
      title: 'Chuyện tình cảm/gia đình',
      icon: 'heart-outline',
      color: '#FF6B9D',
      gradient: ['#FF6B9D', '#C06C84'],
    },
    {
      id: 4,
      title: 'Chỉ là một ngày tồi tệ',
      icon: 'weather-cloudy',
      color: '#95E1D3',
      gradient: ['#95E1D3', '#38ADA9'],
    },
  ];

  // Mood stats - using real data
  const moodStats: MoodStat[] = [
    {
      label: 'Cảm xúc hôm nay',
      value: moodData?.latestMood ? getMoodLabel(moodData.latestMood.moodScore) : 'Chưa có',
      icon: 'emoticon-happy',
      color: moodData?.latestMood ? getMoodColor(moodData.latestMood.moodScore) : '#999',
    },
    {
      label: 'Ngày truy cập',
      value: moodData?.streak?.toString() || '0',
      icon: 'fire',
      color: '#FF6B6B',
    },
  ];

  // Self-care items - using real data if available
  const selfCareItems: SelfCareItem[] = relaxAssets.length > 0
    ? relaxAssets.slice(0, 3).map((asset) => ({
        id: asset.assetId,
        title: asset.title,
        description: asset.type || 'Thư giãn',
        icon: asset.type === 'music' ? 'music-note' : asset.type === 'video' ? 'play-circle' : 'spa',
        color: asset.type === 'music' ? '#A8E6CF' : asset.type === 'video' ? '#FFD3B6' : '#FFAAA5',
      }))
    : [
        {
          id: 1,
          title: 'Âm thanh xoa dịu',
          description: 'Nhạc lo-fi, tiếng mưa, sóng biển',
          icon: 'music-note',
          color: '#A8E6CF',
        },
        {
          id: 2,
          title: 'Lời nhắn tích cực',
          description: 'Quote truyền cảm hứng mỗi ngày',
          icon: 'lightbulb-on-outline',
          color: '#FFD3B6',
        },
        {
          id: 3,
          title: 'Bài tập thở',
          description: 'Thở sâu giảm căng thẳng 2 phút',
          icon: 'lungs',
          color: '#FFAAA5',
        },
      ];

  const handleStartChat = () => {
    // Navigate to chat/matching screen
    console.log('Start chat');
  };

  const handleTopicPress = (topic: QuickStartTopic) => {
    console.log('Topic selected:', topic.title);
    // Navigate to chat with pre-selected topic
  };

  const handleSelfCarePress = (item: SelfCareItem) => {
    console.log('Self-care item:', item.title);
    // Navigate to specific self-care feature
  };

  const handleBlogPress = (blog: Blog) => {
    console.log('Blog selected:', blog.title);
    // Navigate to blog detail
  };

  const handleSubscribePress = async (plan: any) => {
    if (!user?.id) {
      // Navigate to login if user is not logged in
      navigation.navigate('Login');
      return;
    }
    
    console.log('Subscribe to plan:', plan.planName);
    // TODO: Implement subscription logic
    // This could navigate to a payment screen or show a confirmation modal
    alert(`Đăng ký gói ${plan.planName}\nGiá: ${plan.price.toLocaleString('vi-VN')} VNĐ\nThời hạn: ${plan.durationDays} ngày`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#667EEA']}
              tintColor="#667EEA"
            />
          }
        >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Chào {user?.fullName?.split(' ')[0] || 'bạn'} 👋
            </Text>
            <Text style={styles.subGreeting}>
              Hôm nay bạn cảm thấy thế nào?
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#333" />
              {user?.id && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="cog-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mood Stats */}
        <View style={styles.statsContainer}>
          {moodStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            <MaterialCommunityIcons 
              name="emoticon-happy-outline" 
              size={120} 
              color="#667EEA" 
              style={styles.heroIcon}
            />
          </View>
          
          <Text style={styles.heroTitle}>
            Đừng giữ trong lòng,{'\n'}hãy chia sẻ để nhẹ gánh lo
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Sero ở đây để lắng nghe bạn
          </Text>

          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={handleStartChat}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <MaterialCommunityIcons name="chat-outline" size={24} color="#FFF" />
              <Text style={styles.ctaText}>Tìm người lắng nghe ngay</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Start Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Bạn muốn chia sẻ về điều gì?
          </Text>
          
          <View style={styles.topicsGrid}>
            {quickStartTopics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => handleTopicPress(topic)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={topic.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.topicGradient}
                >
                  <View style={styles.topicIconContainer}>
                    <MaterialCommunityIcons 
                      name={topic.icon as any} 
                      size={32} 
                      color="#FFF" 
                    />
                  </View>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Self-care Corner */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="spa" size={24} color="#667EEA" />
            <Text style={styles.sectionTitle}>Góc nhỏ bình yên cho bạn</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selfCareScroll}
          >
            {selfCareItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.selfCareCard}
                onPress={() => handleSelfCarePress(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.selfCareIconContainer, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons 
                    name={item.icon as any} 
                    size={40} 
                    color="#FFF" 
                  />
                </View>
                <Text style={styles.selfCareTitle}>{item.title}</Text>
                <Text style={styles.selfCareDescription}>{item.description}</Text>
                <View style={styles.selfCareArrow}>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#667EEA" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Blogs */}
        {featuredBlogs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="book-open-variant" size={24} color="#667EEA" />
              <Text style={styles.sectionTitle}>Bài viết nổi bật</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.blogsScroll}
            >
              {featuredBlogs.map((blog) => (
                <TouchableOpacity
                  key={blog.blogId}
                  style={styles.blogCard}
                  onPress={() => handleBlogPress(blog)}
                  activeOpacity={0.8}
                >
                  <View style={styles.blogImageContainer}>
                    {blog.thumbnailUrl ? (
                      <Image 
                        source={{ uri: blog.thumbnailUrl }} 
                        style={styles.blogImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.blogImage, styles.blogImagePlaceholder]}>
                        <MaterialCommunityIcons name="image" size={40} color="#CCC" />
                      </View>
                    )}
                    <View style={styles.blogCategoryBadge}>
                      <Text style={styles.blogCategoryText}>{blog.categoryName || 'Chung'}</Text>
                    </View>
                  </View>
                  <View style={styles.blogContent}>
                    <Text style={styles.blogTitle} numberOfLines={2}>{blog.title}</Text>
                    <Text style={styles.blogSummary} numberOfLines={2}>{blog.summary || 'Khám phá những kiến thức hữu ích...'}</Text>
                    <View style={styles.blogMeta}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color="#999" />
                      <Text style={styles.blogReadTime}>{blog.readTime || '5 phút đọc'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFB300" />
            <Text style={styles.sectionTitle}>Mẹo nhanh cho bạn</Text>
          </View>
          
          {quickTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <MaterialCommunityIcons name={tip.icon as any} size={20} color="#667EEA" />
              </View>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        {/* Recent Activities - Only for logged-in users */}
        {recentActivities.length > 0 && user?.id && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="history" size={24} color="#667EEA" />
              <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            </View>
            
            {recentActivities.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityCard}>
                <View style={styles.activityIconContainer}>
                  <MaterialCommunityIcons 
                    name={activity.icon as any} 
                    size={24} 
                    color="#667EEA" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color="#CCC" 
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Daily Quote */}
        <View style={styles.quoteContainer}>
          <MaterialCommunityIcons name="format-quote-open" size={32} color="#667EEA" />
          <Text style={styles.quoteText}>
            {dailyQuote?.content || '"Mỗi ngày là một cơ hội mới để bắt đầu lại. Hãy tử tế với chính mình."'}
          </Text>
          <Text style={styles.quoteAuthor}>- Sero Chat -</Text>
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      )}

      {/* Bottom Tab Bar */}
      <BottomTabBar />
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
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  
  // Mood Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Guest Prompt
  guestPrompt: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guestPromptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestPromptText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  guestPromptButton: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  guestPromptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    color: '#667EEA',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  heroImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    opacity: 0.9,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  
  // Quick Start Topics
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topicGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 20,
    textAlign: 'center',
  },
  
  // Self-care Corner
  selfCareScroll: {
    paddingRight: 20,
  },
  selfCareCard: {
    width: 180,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  selfCareIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selfCareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  selfCareDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  selfCareArrow: {
    alignSelf: 'flex-start',
  },
  
  // Subscription Plans
  plansScroll: {
    paddingRight: 20,
  },
  planCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  planGradient: {
    padding: 24,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    textAlign: 'center',
  },
  planPriceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  planDuration: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  planFeatures: {
    marginBottom: 24,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  planButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667EEA',
  },
  
  // Featured Blogs
  blogsScroll: {
    paddingRight: 20,
  },
  blogCard: {
    width: 280,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  blogImageContainer: {
    position: 'relative',
  },
  blogImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0F0F0',
  },
  blogImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogCategoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#667EEA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  blogCategoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 22,
  },
  blogSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  blogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blogReadTime: {
    fontSize: 13,
    color: '#999',
  },
  
  // Quote
  quoteContainer: {
    marginHorizontal: 20,
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginVertical: 16,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  
  // Quick Tips
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  
  // Recent Activities
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
    color: '#999',
  },
  
  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;
