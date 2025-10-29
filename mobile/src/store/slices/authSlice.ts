import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Beneficiary {
  id: number;
  registration_number: string;
  cpf: string;
  full_name: string;
  status: string;
  beneficiary_type: string;
  company: string;
  health_plan: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

interface AuthState {
  user: User | null;
  beneficiary: Beneficiary | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  beneficiary: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        beneficiary: Beneficiary;
        access: string;
        refresh: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.beneficiary = action.payload.beneficiary;
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.isAuthenticated = true;

      // Save to AsyncStorage
      AsyncStorage.setItem('accessToken', action.payload.access);
      AsyncStorage.setItem('refreshToken', action.payload.refresh);
      AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      AsyncStorage.setItem('beneficiary', JSON.stringify(action.payload.beneficiary));
    },
    logout: (state) => {
      state.user = null;
      state.beneficiary = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Clear AsyncStorage
      AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'beneficiary']);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
