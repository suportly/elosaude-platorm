import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { registerTranslation } from 'react-native-paper-dates';
import pt from 'react-native-paper-dates/src/translations/pt';

// Initialize Sentry
Sentry.init({
  dsn: 'https://your-sentry-dsn@sentry.io/your-project-id', // TODO: Replace with actual DSN from sentry.io
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
