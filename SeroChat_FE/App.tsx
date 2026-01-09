import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatsScreen from './src/screens/ChatsScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import BlogDetailScreen from './src/screens/BlogDetailScreen';
import { AuthProvider } from './src/contexts/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Chats" component={ChatsScreen} />
          <Stack.Screen name="Explore" component={ExploreScreen} />
          <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
