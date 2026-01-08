import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { OnboardingScreen } from '../screens/Onboarding';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, beneficiary } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [accessToken, refreshToken, userStr, beneficiaryStr] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('beneficiary'),
      ]);

      if (accessToken && refreshToken && userStr && beneficiaryStr) {
        dispatch(
          setCredentials({
            user: JSON.parse(userStr),
            beneficiary: JSON.parse(beneficiaryStr),
            access: accessToken,
            refresh: refreshToken,
          })
        );
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  // Determine which navigator to show
  const renderNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    // Check if onboarding is needed (only for users who haven't completed it)
    if (beneficiary && beneficiary.onboarding_completed === false) {
      return <OnboardingNavigator />;
    }

    return <MainNavigator />;
  };

  return (
    <NavigationContainer>
      {renderNavigator()}
    </NavigationContainer>
  );
}
