// Theme Helper - Hướng dẫn sử dụng Dark Mode trong screens

/*
HƯỚNG DẪN SỬ DỤNG THEME TRONG BẤT KỲ SCREEN NÀO:

1. Import useTheme hook:
   import { useTheme } from '../contexts/ThemeContext';

2. Sử dụng trong component:
   const { colors, isDarkMode } = useTheme();

3. Áp dụng màu động cho styles:
   
   a) Inline styles (khuyên dùng):
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Hello</Text>
      
   b) Conditional styles:
      <View style={[styles.card, isDarkMode && styles.cardDark]}>

4. Theme Colors có sẵn:
   - colors.background    // Màu nền chính
   - colors.card          // Màu cho cards, modals
   - colors.text          // Màu text chính
   - colors.textSecondary // Màu text phụ (nhạt hơn)
   - colors.primary       // Màu chủ đạo (purple/blue)
   - colors.border        // Màu viền
   - colors.error         // Màu lỗi (đỏ)
   - colors.success       // Màu thành công (xanh lá)
   - colors.warning       // Màu cảnh báo (cam)
   - colors.info          // Màu thông tin (xanh dương)

5. Ví dụ hoàn chỉnh:

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const MyScreen = () => {
  const { colors, isDarkMode } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Title
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Description
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
  },
});

6. Best Practices:
   - Không hardcode màu trong StyleSheet.create()
   - Sử dụng màu từ theme colors
   - Test cả Light và Dark mode
   - Đặc biệt chú ý StatusBar: 
     <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

7. Screens đã được cập nhật:
   ✅ HomeScreen - Đầy đủ
   ✅ BottomTabBar - Đầy đủ
   
8. Screens cần cập nhật tiếp:
   - LoginScreen
   - MenuScreen
   - ChatsScreen
   - ExploreScreen
   - ProfileScreen
   - BlogDetailScreen
   - Và tất cả các screens khác

9. Components cần cập nhật:
   - AdminSidebar
   - ConversationsModal
   - Các modals/dialogs khác
*/

export {}; // Make this a module
