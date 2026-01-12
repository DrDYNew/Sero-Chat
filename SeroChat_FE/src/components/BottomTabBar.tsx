import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import Svg, { Path } from 'react-native-svg';

interface Tab {
  name: string;
  icon: string;
  iconActive: string;
  label: string;
  route: string;
  isFAB?: boolean;
  isProfile?: boolean;
  badge?: number;
}

const BottomTabBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated, user } = useAuth();
  const currentRoute = route.name;

  const tabs: Tab[] = [
    {
      name: 'Home',
      icon: 'home-variant-outline',
      iconActive: 'home-variant',
      label: 'Trang chủ',
      route: 'Home',
    },
    {
      name: 'Chats',
      icon: 'message-text-outline',
      iconActive: 'message-text',
      label: 'Trò chuyện',
      route: 'Chats',
    },
    {
      name: 'StartChat',
      icon: 'chat-plus-outline',
      iconActive: 'chat-plus',
      label: 'Tìm người nghe',
      route: 'StartChat',
      isFAB: true, // Floating Action Button
    },
    {
      name: 'Explore',
      icon: 'compass-outline',
      iconActive: 'compass',
      label: 'Khám phá',
      route: 'Explore',
    },
    user?.id ? {
      name: 'Menu',
      icon: 'account-outline',
      iconActive: 'account',
      label: 'Hồ sơ',
      route: 'Menu',
      isProfile: true,
    } : {
      name: 'Login',
      icon: 'login',
      iconActive: 'login',
      label: 'Đăng nhập',
      route: 'Login',
    },
  ];

  const handleTabPress = (tab: Tab) => {
    // Các trang đã làm
    const availableScreens = ['Home', 'Login', 'Menu', 'Chats', 'Explore'];
    
    if (availableScreens.includes(tab.route)) {
      navigation.navigate(tab.route);
    } else {
      // Tạm thời chưa có màn hình này
      console.log('Navigate to:', tab.route);
      // TODO: Implement these screens later
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* SVG Shape with notch */}
      <Svg
        width="100%"
        height="85"
        style={styles.svgContainer}
        viewBox="0 0 375 85"
        preserveAspectRatio="none"
      >
        <Path
          d="M0,0 L0,85 L375,85 L375,0 L235,0 Q225,0 215,10 Q200,25 187.5,25 Q175,25 160,10 Q150,0 140,0 Z"
          fill="#FFFFFF"
        />
      </Svg>
      
      <View style={styles.container}>
        {tabs.map((tab: Tab, index: number) => {
        // Check if tab is active
        const isActive = currentRoute === tab.route || 
                        (tab.name === 'Profile' && currentRoute === 'Profile');
        
        // Floating Action Button (FAB) for Start Chat in middle
        if (tab.isFAB) {
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.fabContainer}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.8}
            >
              <View style={styles.fab}>
                <View style={styles.fabInner}>
                  <MaterialCommunityIcons
                    name="chat-plus"
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
              </View>
              <Text style={styles.fabLabel} numberOfLines={1} adjustsFontSizeToFit>{tab.label}</Text>
            </TouchableOpacity>
          );
        }
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {tab.isProfile && user ? (
                <View style={[styles.avatar, isActive && styles.avatarActive]}>
                  <Text style={[styles.avatarText, isActive && styles.avatarTextActive]}>
                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              ) : (
                <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                  <MaterialCommunityIcons
                    name={(isActive ? tab.iconActive : tab.icon) as any}
                    size={22}
                    color={isActive ? '#667EEA' : '#8E8E93'}
                  />

                </View>
              )}
              
              {/* Badge */}
              {tab.badge && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            
            {/* Label */}
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingBottom: 5,
    paddingTop: 26,
    height: 85,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: '#E8F1FF',
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 0,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#667EEA',
    fontWeight: '600',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -56,
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  fabLabel: {
    fontSize: 9,
    color: '#667EEA',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarActive: {
    backgroundColor: '#E8F1FF',
  },
  avatarText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarTextActive: {
    color: '#667EEA',
  },
});

export default BottomTabBar;
