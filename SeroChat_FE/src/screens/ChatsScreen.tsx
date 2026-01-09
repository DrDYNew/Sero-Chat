import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getGeminiResponse, checkInappropriateContent } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatsScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Mình là SERO - trợ lý tâm lý của bạn. Bạn có muốn chia sẻ điều gì với mình không? 😊',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  
  const MAX_GUEST_MESSAGES = 100;
  const isGuest = !user?.id;
  const remainingMessages = isGuest ? MAX_GUEST_MESSAGES - messageCount : null;

  // Load guest message count từ AsyncStorage khi mount
  useEffect(() => {
    if (isGuest) {
      loadGuestMessageCount();
    }
  }, [isGuest]);

  // Scroll to bottom when new message added
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadGuestMessageCount = async () => {
    try {
      const storedData = await AsyncStorage.getItem('guestMessageData');
      if (storedData) {
        const { count, date } = JSON.parse(storedData);
        const today = new Date().toDateString();
        
        // Nếu cùng ngày, load số tin nhắn đã dùng
        if (date === today) {
          setMessageCount(count);
        } else {
          // Ngày mới, reset về 0
          await AsyncStorage.setItem('guestMessageData', JSON.stringify({
            count: 0,
            date: today
          }));
          setMessageCount(0);
        }
      } else {
        // Lần đầu, khởi tạo
        await AsyncStorage.setItem('guestMessageData', JSON.stringify({
          count: 0,
          date: new Date().toDateString()
        }));
      }
    } catch (error) {
      console.error('Error loading guest message count:', error);
    }
  };

  const saveGuestMessageCount = async (newCount: number) => {
    try {
      await AsyncStorage.setItem('guestMessageData', JSON.stringify({
        count: newCount,
        date: new Date().toDateString()
      }));
    } catch (error) {
      console.error('Error saving guest message count:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Check guest limit
    if (isGuest && messageCount >= MAX_GUEST_MESSAGES) {
      Alert.alert(
        'Đã hết lượt trò chuyện miễn phí',
        'Bạn đã sử dụng hết 100 tin nhắn miễn phí trong ngày. Đăng nhập để tiếp tục trò chuyện không giới hạn!',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Tăng và lưu message count cho guest
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    if (isGuest) {
      await saveGuestMessageCount(newCount);
    }

    try {
      // Call AI API
      const aiResponse = await getAIResponse(userMessage.text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, mình gặp chút vấn đề. Bạn thử lại nhé! 🙏',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Check for inappropriate questions
    const isInappropriate = await checkInappropriateContent(userMessage);
    if (isInappropriate) {
      return 'Xin lỗi bạn, mình chỉ có thể hỗ trợ về các vấn đề tâm lý và sức khỏe tinh thần. Nếu bạn có lo lắng hay căng thẳng gì, hãy chia sẻ với mình nhé! 💙';
    }

    // Call Gemini AI via backend
    const { response: aiResponse, isCrisis } = await getGeminiResponse(userMessage, user?.id);
    
    // Nếu phát hiện khủng hoảng, hiển thị modal
    if (isCrisis) {
      setShowCrisisModal(true);
    }
    
    return aiResponse;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <MaterialCommunityIcons name="robot-happy" size={20} color="#667EEA" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <MaterialCommunityIcons name="account" size={20} color="#FFF" />
          </View>
        )}
      </View>
    );
  };

  const handleContactDoctor = () => {
    setShowCrisisModal(false);
    // TODO: Navigate to Contact/Doctor tab khi tab đó đã được tạo
    // navigation.navigate('Contact');
    console.log('Navigate to Contact tab');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Crisis Modal */}
      <Modal
        visible={showCrisisModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCrisisModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <MaterialCommunityIcons name="heart-pulse" size={48} color="#FFF" />
              <Text style={styles.modalTitle}>Chúng tôi quan tâm đến bạn</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>
                Cuộc sống của bạn rất quý giá. Nếu bạn đang gặp khó khăn, hãy biết rằng bạn không đơn độc. 
              </Text>
              
              <View style={styles.helplineBox}>
                <MaterialCommunityIcons name="phone" size={24} color="#667EEA" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.helplineTitle}>Đường dây nóng 24/7</Text>
                  <Text style={styles.helplineNumber}>1800 1234</Text>
                  <Text style={styles.helplineNote}>Miễn phí, bảo mật tuyệt đối</Text>
                </View>
              </View>

              <Text style={styles.modalSubtext}>
                Hoặc bạn có thể liên hệ với các bác sĩ tâm lý chuyên nghiệp trong ứng dụng.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowCrisisModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Để sau</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContactDoctor}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <MaterialCommunityIcons name="doctor" size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>Xem Bác sĩ</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>SERO Chat</Text>
            <Text style={styles.headerSubtitle}>Trợ lý tâm lý AI</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Guest Warning Banner */}
        {isGuest && (
          <View style={styles.guestBanner}>
            <MaterialCommunityIcons name="information" size={20} color="#FF9800" />
            <Text style={styles.guestBannerText}>
              Bạn còn {remainingMessages} tin nhắn miễn phí
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#667EEA" />
            <Text style={styles.loadingText}>SERO đang trả lời...</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn của bạn..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <MaterialCommunityIcons 
              name="send" 
              size={24} 
              color={inputText.trim() && !isLoading ? '#FFF' : '#CCC'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#667EEA',
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF3E0',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
    gap: 8,
  },
  guestBannerText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#667EEA',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  aiText: {
    color: '#333',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F1FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#667EEA',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  // Crisis Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
  },
  helplineBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#667EEA',
    gap: 12,
    alignItems: 'center',
  },
  helplineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },
  helplineNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  helplineNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalSubtext: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default ChatsScreen;
