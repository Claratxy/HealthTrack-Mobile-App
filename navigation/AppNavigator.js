import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useProfileContext } from '../context/ProfileContext';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const RootStack = createNativeStackNavigator();

import HomeScreen from '../screens/HomeScreen';
import HealthItemsScreen from '../screens/HealthItemsScreen';
import MedicineFormScreen from '../screens/MedicineFormScreen';
import AppointmentFormScreen from '../screens/AppointmentFormScreen';
import HealthRecordScreen from '../screens/HealthRecordScreen';
import HealthRecordFormScreen from '../screens/HealthRecordFormScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CycleScreen from '../screens/CycleScreen';
import AddCycleLogScreen from '../screens/AddCycleLogScreen';
import EditCycleSettingsScreen from '../screens/EditCycleSettingsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CalendarStack = createNativeStackNavigator();
const ItemsStack = createNativeStackNavigator();
const RecordStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const CycleStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'HealthTrack' }} />
      <HomeStack.Screen name="MedicineForm" component={MedicineFormScreen} options={({ route }) => ({ title: route.params?.medicineId ? 'Edit Medicine' : 'Add Medicine' })} />
      <HomeStack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={({ route }) => ({ title: route.params?.appointmentId ? 'Edit Appointment' : 'Add Appointment' })} />
      <HomeStack.Screen name="HealthRecordForm" component={HealthRecordFormScreen} options={({ route }) => ({ title: route.params?.recordId ? 'Edit Health Record' : 'Add Health Record' })} />
    </HomeStack.Navigator>
  );
}

function CalendarStackNavigator() {
  return (
    <CalendarStack.Navigator>
      <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} options={{ title: 'Calendar' }} />
    </CalendarStack.Navigator>
  );
}

function ItemsStackNavigator() {
  return (
    <ItemsStack.Navigator>
      <ItemsStack.Screen name="ItemsMain" component={HealthItemsScreen} options={{ title: 'Medicines & Appointments' }} />
      <ItemsStack.Screen name="MedicineForm" component={MedicineFormScreen} options={({ route }) => ({ title: route.params?.medicineId ? 'Edit Medicine' : 'Add Medicine' })} />
      <ItemsStack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={({ route }) => ({ title: route.params?.appointmentId ? 'Edit Appointment' : 'Add Appointment' })} />
    </ItemsStack.Navigator>
  );
}

function RecordStackNavigator() {
  return (
    <RecordStack.Navigator>
      <RecordStack.Screen name="RecordMain" component={HealthRecordScreen} options={{ title: 'Health Records' }} />
      <RecordStack.Screen name="HealthRecordForm" component={HealthRecordFormScreen} options={({ route }) => ({ title: route.params?.recordId ? 'Edit Health Record' : 'Add Health Record' })} />
    </RecordStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    </ProfileStack.Navigator>
  );
}

function CycleStackNavigator() {
  return (
    <CycleStack.Navigator>
      <CycleStack.Screen name="CycleMain" component={CycleScreen} options={{ title: 'Cycle Tracking' }} />
      <CycleStack.Screen name="AddCycleLog" component={AddCycleLogScreen} options={{ title: 'Log Period Start' }} />
      <CycleStack.Screen name="EditCycleSettings" component={EditCycleSettingsScreen} options={{ title: 'Cycle Settings' }} />
    </CycleStack.Navigator>
  );
}

const TAB_ICONS = {
  Home: 'home-outline',
  Calendar: 'calendar-number-outline',
  Items: 'medkit-outline',
  Records: 'document-text-outline',
  Cycle: 'water-outline',
  Profile: 'person-outline',
};

export default function AppNavigator() {
  const { isLoggedIn, accountExists, initializing } = useAuth();
  const { profile, refreshProfile } = useProfileContext();

  useEffect(() => {
    if (isLoggedIn) refreshProfile();
  }, [isLoggedIn, refreshProfile]);

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7F6' }}>
        <ActivityIndicator size="large" color="#2E7D6B" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={accountExists ? 'Login' : 'Register'}
      >
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Register" component={RegisterScreen} />
      </RootStack.Navigator>
    );
  }

  const cycleEnabled = profile?.cycleTrackingEnabled || false;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2E7D6B',
        tabBarInactiveTintColor: '#9AA5A0',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} />
      <Tab.Screen name="Items" component={ItemsStackNavigator} options={{ title: 'Medicines & Appts' }} />
      <Tab.Screen name="Records" component={RecordStackNavigator} />
      {cycleEnabled && <Tab.Screen name="Cycle" component={CycleStackNavigator} />}
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}