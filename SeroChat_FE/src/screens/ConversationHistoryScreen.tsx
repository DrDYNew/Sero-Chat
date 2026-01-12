import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { chatService, Conversation } from '../services/chatService';
import { LinearGradient } from 'expo-linear-gradient';

const ConversationHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await chatService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử trò chuyện');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleSelectConversation = (convId: number, title: string) => {
    navigation.navigate('Chats', {
      conversationId: convId,
      conversationTitle: title,
    });
  };

  const handleDeleteConversation = (convId: number, title: string) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      `Bạn có chắc muốn xóa "${title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteConversation(convId);
              setConversations(conversations.filter(c => c.convId !== convId));
              Alert.alert('Thành công', 'Đã xóa cuộc trò chuyện');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa cuộc trò chuyện');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => handleSelectConversation(item.convId, item.title)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationIcon}>
        <MaterialCommunityIcons name="chat-processing" size={24} color="#667EEA" />
      </View>
      
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.lastMessage && (
          <Text style={styles.conversationLastMessage} numberOfLines={2}>
            {item.lastMessage}
          </Text>
        )}
        <Text style={styles.conversationDate}>
          {formatDate(item.lastMessageTime || item.createdAt)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteConversation(item.convId, item.title)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="chat-outline" size={80} color="#CCC" />
      <Text style={styles.emptyTitle}>Chưa có lịch sử trò chuyện</Text>
      <Text style={styles.emptySubtitle}>
        Bắt đầu chat với SERO để lưu lại lịch sử
      </Text>
      <TouchableOpacity
        style={styles.startChatButton}
        onPress={() => navigation.navigate('Chats')}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startChatGradient}
        >
          <MaterialCommunityIcons name="chat-plus" size={20} color="#FFF" />
          <Text style={styles.startChatText}>Bắt đầu chat</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử trò chuyện</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Chats')}
          style={styles.newChatButton}
        >
          <MaterialCommunityIcons name="chat-plus" size={24} color="#667EEA" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.convId.toString()}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#667EEA']}
              tintColor="#667EEA"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  newChatButton: {
    padding: 4,
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
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  conversationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  conversationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  startChatButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  startChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  startChatText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default ConversationHistoryScreen;
