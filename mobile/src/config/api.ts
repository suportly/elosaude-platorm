import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// API Configuration
// For Android Emulator use 10.0.2.2, for iOS Simulator use localhost
// For physical devices, use your computer's IP address (e.g., 192.168.77.11)

// Change this to your machine's IP if using physical device or if localhost doesn't work
// Use the WiFi IP (192.168.0.116) instead of VPN/bridge IP (192.168.77.11)
const MACHINE_IP = '192.168.0.116';

const getDevAPIUrl = () => {
  if (Platform.OS === 'android') {
    // Android Emulator uses special IP to access host machine
    return 'http://10.0.2.2:8000/api';
  }
  // iOS Simulator can use localhost
  // If localhost doesn't work, try using your machine's IP
  return `http://${MACHINE_IP}:8000/api`;
};

export const API_URL = __DEV__
  ? getDevAPIUrl()
  : 'https://api.elosaude.com/api';

// Log API URL for debugging
if (__DEV__) {
  console.log('📱 Platform:', Platform.OS);
  console.log('🌐 API URL:', API_URL);
  console.log('💻 Backend should be running at: http://0.0.0.0:8000');
  console.log('🔗 Full test endpoint:', `${API_URL}/accounts/test-login/`);
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL.replace('/api', '')}/api/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        await AsyncStorage.setItem('accessToken', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
