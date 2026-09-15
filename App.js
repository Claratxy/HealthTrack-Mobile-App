import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}