import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio, Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as relaxService from '../services/relaxService';

const { width } = Dimensions.get('window');

const RelaxPlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { asset } = route.params as { asset: relaxService.RelaxAsset };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const videoRef = useRef<Video | null>(null);

  useEffect(() => {
    setupPlayer();
    return () => {
      cleanup();
    };
  }, []);

  const setupPlayer = async () => {
    try {
      if (asset.type === 'BREATHING') {
        // Video player for breathing exercises
        setIsLoading(false);
      } else {
        // Audio player for music and meditation
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: asset.mediaUrl },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );
        
        soundRef.current = sound;
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error setting up player:', error);
      Alert.alert('Lỗi', 'Không thể tải nội dung. Vui lòng thử lại sau.');
      setIsLoading(false);
    }
  };

  const cleanup = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      if (asset.type === 'BREATHING' && videoRef.current) {
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await videoRef.current.pauseAsync();
          } else {
            await videoRef.current.playAsync();
          }
        }
      } else if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
          } else {
            await soundRef.current.playAsync();
          }
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Lỗi', 'Không thể phát/tạm dừng');
    }
  };

  const handleSeek = async (value: number) => {
    try {
      if (asset.type === 'BREATHING' && videoRef.current) {
        await videoRef.current.setPositionAsync(value);
      } else if (soundRef.current) {
        await soundRef.current.setPositionAsync(value);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getGradientColors = (): [string, string] => {
    switch (asset.type) {
      case 'MUSIC':
        return ['#667EEA', '#764BA2'];
      case 'BREATHING':
        return ['#F857A6', '#FF5858'];
      case 'MEDITATION':
        return ['#56CCF2', '#2F80ED'];
      default:
        return ['#667EEA', '#764BA2'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerType}>
              {relaxService.getAssetTypeLabel(asset.type)}
            </Text>
            {asset.isPremium && (
              <View style={styles.premiumBadgeHeader}>
                <MaterialCommunityIcons name="crown" size={14} color="#FFD700" />
                <Text style={styles.premiumTextHeader}>Premium</Text>
              </View>
            )}
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {asset.type === 'BREATHING' ? (
            // Video Player for breathing exercises
            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                source={{ uri: asset.mediaUrl }}
                style={styles.video}
                useNativeControls={false}
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                onPlaybackStatusUpdate={(status) => {
                  if (status.isLoaded) {
                    setIsPlaying(status.isPlaying);
                    setPosition(status.positionMillis);
                    setDuration(status.durationMillis || 0);
                  }
                }}
              />
            </View>
          ) : (
            // Visual for audio (music/meditation)
            <View style={styles.artworkContainer}>
              <View style={styles.artwork}>
                <MaterialCommunityIcons
                  name={relaxService.getAssetTypeIcon(asset.type) as any}
                  size={120}
                  color="#FFF"
                />
              </View>
            </View>
          )}

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{asset.title}</Text>
            <Text style={styles.subtitle}>
              {relaxService.getAssetTypeLabel(asset.type)}
            </Text>
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
          )}

          {/* Player Controls */}
          {!isLoading && (
            <View style={styles.controls}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
                    ]} 
                  />
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(position)}</Text>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>

              {/* Play/Pause Button */}
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isPlaying ? 'pause' : 'play'}
                  size={48}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFF" />
            <Text style={styles.tipsText}>
              {asset.type === 'BREATHING'
                ? 'Thở theo hướng dẫn trong video'
                : 'Ngồi hoặc nằm thoải mái, tập trung vào âm thanh'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  headerType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  premiumBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  premiumTextHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
  },
  videoContainer: {
    width: width - 48,
    height: (width - 48) * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  artworkContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  loader: {
    marginVertical: 32,
  },
  controls: {
    paddingVertical: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  tipsText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
    flex: 1,
  },
});

export default RelaxPlayerScreen;
