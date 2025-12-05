import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Image, View } from 'react-native';
import GuidesScreen from '../screens/Guides/GuidesScreen';
import CreateGuideScreen from '../screens/Guides/CreateGuideScreen';
import GuideDetailScreen from '../screens/Guides/GuideDetailScreen';
import { Colors } from '../config/theme';

// Logo component for header
const HeaderLogo = () => (
  <View style={{ paddingVertical: 8 }}>
    <Image
      source={require('../../assets/images/elosaude_logo.png')}
      style={{
        width: 120,
        height: 35,
        resizeMode: 'contain',
      }}
    />
  </View>
);

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
          headerTitle: () => <HeaderLogo />,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: Colors.primary.main,
        }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={{
          headerShown: true,
          title: 'Detalhes da Guia',
          headerTitle: () => <HeaderLogo />,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: Colors.primary.main,
        }}
      />
    </Stack.Navigator>
  );
}
