import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GuidesScreen from '../screens/Guides/GuidesScreen';
import CreateGuideScreen from '../screens/Guides/CreateGuideScreen';
import GuideDetailScreen from '../screens/Guides/GuideDetailScreen';
import { Colors } from '../config/theme';

const Stack = createStackNavigator();

export default function GuidesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GuidesList" component={GuidesScreen} />
      <Stack.Screen
        name="CreateGuide"
        component={CreateGuideScreen}
        options={{
          headerShown: true,
          title: 'Nova Guia',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: Colors.primary,
        }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={{
          headerShown: true,
          title: 'Detalhes da Guia',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: Colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}
