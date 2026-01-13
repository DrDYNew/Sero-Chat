import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatsScreen from './src/screens/ChatsScreen';
import ConversationHistoryScreen from './src/screens/ConversationHistoryScreen';
import MoodLogScreen from './src/screens/MoodLogScreen';
import RelaxationScreen from './src/screens/RelaxationScreen';
import RelaxPlayerScreen from './src/screens/RelaxPlayerScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import BlogDetailScreen from './src/screens/BlogDetailScreen';
import MenuScreen from './src/screens/MenuScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import ManageUsersScreen from './src/screens/ManageUsersScreen';
import ManageDoctorsScreen from './src/screens/ManageDoctorsScreen';
import AddDoctorScreen from './src/screens/AddDoctorScreen';
import EditDoctorScreen from './src/screens/EditDoctorScreen';
import DoctorDetailAdminScreen from './src/screens/DoctorDetailAdminScreen';
import ManageRelaxScreen from './src/screens/ManageRelaxScreen';
import AddRelaxAssetScreen from './src/screens/AddRelaxAssetScreen';
import EditRelaxAssetScreen from './src/screens/EditRelaxAssetScreen';
import RelaxDetailAdminScreen from './src/screens/RelaxDetailAdminScreen';
import UserDetailScreen from './src/screens/UserDetailScreen';
import AddEditUserScreen from './src/screens/AddEditUserScreen';
import ManageSubscriptionPlansScreen from './src/screens/ManageSubscriptionPlansScreen';
import AddEditSubscriptionPlanScreen from './src/screens/AddEditSubscriptionPlanScreen';
import SubscriptionPlansScreen from './src/screens/SubscriptionPlansScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentQRScreen from './src/screens/PaymentQRScreen';
import ManageBlogsScreen from './src/screens/ManageBlogsScreen';
import AdminBlogDetailScreen from './src/screens/AdminBlogDetailScreen';
import AddEditBlogScreen from './src/screens/AddEditBlogScreen';
import SavedBlogsScreen from './src/screens/SavedBlogsScreen';
import ReadHistoryScreen from './src/screens/ReadHistoryScreen';
import DoctorListScreen from './src/screens/DoctorListScreen';
import DoctorDetailScreen from './src/screens/DoctorDetailScreen';
import EmergencyHotlineScreen from './src/screens/EmergencyHotlineScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import AboutScreen from './src/screens/AboutScreen';
import NotificationScreen from './src/screens/NotificationScreen';
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
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Chats" component={ChatsScreen} />
          <Stack.Screen name="ConversationHistory" component={ConversationHistoryScreen} />
          <Stack.Screen name="MoodLog" component={MoodLogScreen} />
          <Stack.Screen name="Relaxation" component={RelaxationScreen} />
          <Stack.Screen name="RelaxPlayer" component={RelaxPlayerScreen} />
          <Stack.Screen name="Explore" component={ExploreScreen} />
          <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="ManageDoctors" component={ManageDoctorsScreen} />
          <Stack.Screen name="AddDoctor" component={AddDoctorScreen} />
          <Stack.Screen name="EditDoctor" component={EditDoctorScreen} />
          <Stack.Screen name="DoctorDetailAdmin" component={DoctorDetailAdminScreen} />
          <Stack.Screen name="ManageRelax" component={ManageRelaxScreen} />
          <Stack.Screen name="AddRelaxAsset" component={AddRelaxAssetScreen} />
          <Stack.Screen name="EditRelaxAsset" component={EditRelaxAssetScreen} />
          <Stack.Screen name="RelaxDetailAdmin" component={RelaxDetailAdminScreen} />
          <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
          <Stack.Screen name="UserDetail" component={UserDetailScreen} />
          <Stack.Screen name="AddEditUser" component={AddEditUserScreen} />
          <Stack.Screen name="ManageSubscriptionPlans" component={ManageSubscriptionPlansScreen} />
          <Stack.Screen name="AddEditSubscriptionPlan" component={AddEditSubscriptionPlanScreen} />
          <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="PaymentQR" component={PaymentQRScreen} />
          <Stack.Screen name="ManageBlogs" component={ManageBlogsScreen} />
          <Stack.Screen name="AdminBlogDetail" component={AdminBlogDetailScreen} />
          <Stack.Screen name="AddEditBlog" component={AddEditBlogScreen} />
          <Stack.Screen name="SavedBlogs" component={SavedBlogsScreen} />
          <Stack.Screen name="ReadHistory" component={ReadHistoryScreen} />
          <Stack.Screen name="DoctorList" component={DoctorListScreen} />
          <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
          <Stack.Screen name="EmergencyHotline" component={EmergencyHotlineScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
