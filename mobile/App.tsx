import * as Sentry from '@sentry/react-native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { registerTranslation } from 'react-native-paper-dates';
import pt from 'react-native-paper-dates/src/translations/pt';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store';

// Initialize Sentry
Sentry.init({
  dsn: 'https://d170b79ee0b3621263149d731ec6cb0e@o4509759668682752.ingest.us.sentry.io/4510382904442880', // TODO: Replace with actual DSN from sentry.io
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  // Debug mode for development
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
  // Attach stack traces to errors
  attachStacktrace: true,
  // Enable auto session tracking
  enableAutoSessionTracking: true,
  // Session tracking interval
  sessionTrackingIntervalMillis: 10000,
});

// Register Portuguese locale for date picker
registerTranslation('pt', pt);

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PaperProvider>
          <SafeAreaProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </SafeAreaProvider>
        </PaperProvider>
      </Provider>
    </ErrorBoundary>
  );
}
