import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  shadow: string;
  gradient: [string, string];
  gradientDark: [string, string];
  error: string;
  success: string;
  warning: string;
  info: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  colors: ThemeColors;
  loading: boolean;
}

const lightColors: ThemeColors = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1A202C',
  textSecondary: '#718096',
  primary: '#667EEA',
  border: '#E2E8F0',
  shadow: '#000000',
  gradient: ['#667EEA', '#764BA2'],
  gradientDark: ['#4C51BF', '#553C9A'],
  error: '#F56565',
  success: '#48BB78',
  warning: '#ED8936',
  info: '#4299E1',
};

const darkColors: ThemeColors = {
  background: '#0F1419',
  card: '#1A202C',
  text: '#F7FAFC',
  textSecondary: '#A0AEC0',
  primary: '#7C3AED',
  border: '#2D3748',
  shadow: '#000000',
  gradient: ['#7C3AED', '#9333EA'],
  gradientDark: ['#6D28D9', '#7E22CE'],
  error: '#FC8181',
  success: '#68D391',
  warning: '#F6AD55',
  info: '#63B3ED',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load theme preference khi app khởi động
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Nếu chưa có preference, dùng system theme
        const colorScheme = Appearance.getColorScheme();
        setIsDarkMode(colorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('themePreference', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
