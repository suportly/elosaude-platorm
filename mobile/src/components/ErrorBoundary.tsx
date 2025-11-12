import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Sentry from '@sentry/react-native';
import { Colors } from '../config/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Icon name="alert-circle-outline" size={80} color={Colors.error} />
          <Text variant="headlineSmall" style={styles.title}>
            Ops! Algo deu errado
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            Desculpe pelo inconveniente. O erro foi reportado e nossa equipe irá
            investigar.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text variant="bodySmall" style={styles.errorText}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}
          <Button
            mode="contained"
            onPress={this.handleReset}
            style={styles.button}
            buttonColor={Colors.primary}
          >
            Tentar Novamente
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
    color: Colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorDetails: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    maxWidth: '90%',
  },
  errorText: {
    color: '#E65100',
    fontFamily: 'monospace',
  },
  button: {
    marginTop: 10,
    paddingHorizontal: 30,
  },
});

export default ErrorBoundary;
