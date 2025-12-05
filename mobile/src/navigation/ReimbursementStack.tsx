import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ReimbursementScreen from '../screens/Reimbursement/ReimbursementScreen';
import CreateReimbursementScreen from '../screens/Reimbursement/CreateReimbursementScreen';
import ReimbursementDetailScreen from '../screens/Reimbursement/ReimbursementDetailScreen';
import { Colors } from '../config/theme';

const Stack = createStackNavigator();

export default function ReimbursementStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ReimbursementList" component={ReimbursementScreen} />
      <Stack.Screen
        name="CreateReimbursement"
        component={CreateReimbursementScreen}
        options={{
          headerShown: true,
          title: 'Nova Solicitação',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: Colors.primary.main,
        }}
      />
      <Stack.Screen
        name="ReimbursementDetail"
        component={ReimbursementDetailScreen}
        options={{
          headerShown: true,
          title: 'Detalhes do Reembolso',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: Colors.primary.main,
        }}
      />
    </Stack.Navigator>
  );
}
