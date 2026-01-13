import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { moodService, MoodLog } from '../services/moodService';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const MoodLogScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [moodNote, setMoodNote] = useState('');

  useEffect(() => {
    loadMoodLogs();
  }, []);

  const loadMoodLogs = async () => {
    try {
      setLoading(true);
      const response = await moodService.getMoodLogs();
      if (response.success && response.data) {
        setMoodLogs(response.data);
      }
    } catch (error) {
      console.error('Load mood logs error:', error);
      // Fail silently, just show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoodLog = async () => {
    if (!selectedMood) {
      Alert.alert('Thông báo', 'Vui lòng chọn mức tâm trạng');
      return;
    }

    try {
      setLoading(true);
      const response = await moodService.createMoodLog({
        moodScore: selectedMood,
        note: moodNote.trim() || undefined,
      });
      
      if (response.success && response.data) {
        setMoodLogs([response.data, ...moodLogs]);
        setShowAddModal(false);
        setSelectedMood(3);
        setMoodNote('');
        Alert.alert('Thành công', 'Đã ghi lại tâm trạng của bạn');
      }
    } catch (error) {
      console.error('Create mood log error:', error);
      Alert.alert('Lỗi', 'Không thể lưu nhật ký tâm trạng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMoodLog = (logId: number) => {
    Alert.alert(
      'Xóa nhật ký',
      'Bạn có chắc muốn xóa nhật ký này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await moodService.deleteMoodLog(logId);
              if (response.success) {
                setMoodLogs(moodLogs.filter(log => log.logId !== logId));
                Alert.alert('Thành công', 'Đã xóa nhật ký');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa nhật ký');
            }
          },
        },
      ]
    );
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 5) return '😄';
    if (score >= 4) return '😊';
    if (score >= 3) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  const getMoodLabel = (score: number) => {
    if (score >= 5) return 'Rất tốt';
    if (score >= 4) return 'Tốt';
    if (score >= 3) return 'Bình thường';
    if (score >= 2) return 'Không tốt';
    return 'Rất tệ';
  };

  const getMoodColor = (score: number) => {
    if (score >= 5) return '#10B981';
    if (score >= 4) return '#3B82F6';
    if (score >= 3) return '#F59E0B';
    if (score >= 2) return '#EF4444';
    return '#991B1B';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateAverageMood = () => {
    if (moodLogs.length === 0) return 0;
    const sum = moodLogs.reduce((acc, log) => acc + log.moodScore, 0);
    return (sum / moodLogs.length).toFixed(1);
  };

  const renderMoodSelector = () => {
    const moods = [
      { score: 5, emoji: '😄', label: 'Rất tốt' },
      { score: 4, emoji: '😊', label: 'Tốt' },
      { score: 3, emoji: '😐', label: 'Bình thường' },
      { score: 2, emoji: '😔', label: 'Không tốt' },
      { score: 1, emoji: '😢', label: 'Rất tệ' },
    ];

    return (
      <View style={styles.moodSelectorContainer}>
        <Text style={[styles.modalLabel, { color: colors.text }]}>Tâm trạng của bạn hôm nay thế nào?</Text>
        <View style={styles.moodOptions}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.score}
              style={[
                styles.moodOption,
                { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: isDarkMode ? '#334155' : '#E5E7EB' },
                selectedMood === mood.score && [styles.moodOptionSelected, { backgroundColor: isDarkMode ? '#1E40AF' : '#EEF2FF', borderColor: colors.primary }],
              ]}
              onPress={() => setSelectedMood(mood.score)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, { color: selectedMood === mood.score ? colors.primary : colors.textSecondary }]}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { borderBottomColor: isDarkMode ? '#334155' : '#F0F0F0' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Ghi lại tâm trạng</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {renderMoodSelector()}

            <View style={styles.noteContainer}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Ghi chú (không bắt buộc)</Text>
              <TextInput
                style={[styles.noteInput, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: isDarkMode ? '#334155' : '#E5E7EB', color: colors.text }]}
                placeholder="Chia sẻ cảm xúc, suy nghĩ của bạn..."
                placeholderTextColor={isDarkMode ? '#64748B' : '#999'}
                multiline
                numberOfLines={4}
                value={moodNote}
                onChangeText={setMoodNote}
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: colors.textSecondary }]}>{moodNote.length}/500</Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddMoodLog}
              disabled={loading}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Đang lưu...' : 'Lưu lại'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStatsCard = () => (
    <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.text }]}>{moodLogs.length}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bản ghi</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: isDarkMode ? '#334155' : '#E5E7EB' }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.text }]}>{calculateAverageMood()}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trung bình</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: isDarkMode ? '#334155' : '#E5E7EB' }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { fontSize: 32 }]}>
          {moodLogs.length > 0 ? getMoodEmoji(moodLogs[0].moodScore) : '😊'}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gần nhất</Text>
      </View>
    </View>
  );

  const renderMoodLogItem = (log: MoodLog) => {
    const moodColor = getMoodColor(log.moodScore);
    
    return (
      <View key={log.logId} style={[styles.logCard, { backgroundColor: colors.card }]}>
        <View style={styles.logHeader}>
          <View style={styles.logMoodContainer}>
            <View style={[styles.logMoodCircle, { backgroundColor: moodColor }]}>
              <Text style={styles.logMoodEmoji}>{getMoodEmoji(log.moodScore)}</Text>
            </View>
            <View>
              <Text style={[styles.logMoodLabel, { color: colors.text }]}>{getMoodLabel(log.moodScore)}</Text>
              <Text style={[styles.logDate, { color: colors.textSecondary }]}>{formatDate(log.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.logActions}>
            <View style={[styles.logScore, { backgroundColor: moodColor + '20' }]}>
              <Text style={[styles.logScoreText, { color: moodColor }]}>
                {log.moodScore}/5
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => handleDeleteMoodLog(log.logId)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        {log.note && (
          <View style={styles.logNoteContainer}>
            <MaterialCommunityIcons name="text" size={16} color={colors.textSecondary} />
            <Text style={[styles.logNote, { color: colors.textSecondary }]}>{log.note}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="emoticon-happy-outline" size={80} color={isDarkMode ? '#334155' : '#CCC'} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có nhật ký tâm trạng</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Bắt đầu ghi lại cảm xúc của bạn mỗi ngày để theo dõi sức khỏe tinh thần
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB' }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nhật ký tâm trạng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        {renderStatsCard()}

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Ghi lại tâm trạng hôm nay</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Mood Logs List */}
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Lịch sử</Text>
          {moodLogs.length > 0 ? (
            moodLogs.map(renderMoodLogItem)
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      {/* Add Modal */}
      {renderAddModal()}
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
  },
  content: {
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#667EEA',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  addButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  logsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  logCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logMoodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logMoodEmoji: {
    fontSize: 24,
  },
  logMoodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  logScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logScoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteIconButton: {
    padding: 4,
  },
  logNoteContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  logNote: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  moodSelectorContainer: {
    marginBottom: 24,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodOptionSelected: {
    backgroundColor: '#F3F4FF',
    borderColor: '#667EEA',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  noteContainer: {
    marginBottom: 24,
  },
  noteInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default MoodLogScreen;
