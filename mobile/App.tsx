import React from 'react';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ptBR, registerTranslation } from 'react-native-paper-dates';

// Register Portuguese locale for date picker
registerTranslation('pt', ptBR);

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}
