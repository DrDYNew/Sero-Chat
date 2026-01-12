import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { chatService, Conversation } from '../services/chatService';

interface ConversationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectConversation: (convId: number, title: string) => void;
  onNewConversation: () => void;
  currentConvId?: number;
}

const ConversationsModal: React.FC<ConversationsModalProps> = ({
  visible,
  onClose,
  onSelectConversation,
  onNewConversation,
  currentConvId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử chat');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = (convId: number) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      'Bạn có chắc muốn xóa cuộc trò chuyện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteConversation(convId);
              setConversations(conversations.filter(c => c.convId !== convId));
              if (currentConvId === convId) {
                onNewConversation();
              }
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
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Hôm qua';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('vi-VN', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const isActive = item.convId === currentConvId;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, isActive && styles.activeConversation]}
        onPress={() => {
          onSelectConversation(item.convId, item.title);
          onClose();
        }}
      >
        <View style={styles.conversationIcon}>
          <MaterialCommunityIcons 
            name="chat-outline" 
            size={24} 
            color={isActive ? '#667EEA' : '#999'} 
          />
        </View>
        <View style={styles.conversationContent}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.lastMessage && (
            <Text style={styles.conversationPreview} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>
        <View style={styles.conversationMeta}>
          <Text style={styles.conversationTime}>
            {formatDate(item.lastMessageTime || item.createdAt)}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteConversation(item.convId)}
          >
            <MaterialCommunityIcons name="delete-outline" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lịch sử chat</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* New Chat Button */}
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              onNewConversation();
              onClose();
            }}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="#667EEA" />
            <Text style={styles.newChatText}>Tạo cuộc trò chuyện mới</Text>
          </TouchableOpacity>

          {/* Conversations List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667EEA" />
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="chat-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>Chưa có lịch sử chat</Text>
              <Text style={styles.emptySubtext}>
                Bắt đầu trò chuyện mới để lưu lại lịch sử
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.convId.toString()}
              renderItem={renderConversationItem}
              contentContainerStyle={styles.conversationsList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    gap: 12,
  },
  newChatText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
    textAlign: 'center',
  },
  conversationsList: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    gap: 12,
  },
  activeConversation: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#667EEA',
  },
  conversationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#999',
  },
  conversationMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  conversationTime: {
    fontSize: 12,
    color: '#BBB',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
});

export default ConversationsModal;