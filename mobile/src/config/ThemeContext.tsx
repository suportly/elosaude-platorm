/**
 * ThemeContext - Gerenciamento de tema (light/dark mode)
 *
 * Fornece contexto para cores dinâmicas baseadas no tema atual.
 * Respeita preferência do sistema por padrão, permite override manual.
 */

import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, DarkColors } from './theme';

// Tipo de preferência de tema
export type ThemeMode = 'light' | 'dark' | 'system';

// Interface do contexto
interface ThemeContextType {
  // Cores atuais (light ou dark)
  colors: typeof Colors;

  // Se está em dark mode
  isDark: boolean;

  // Preferência atual do usuário
  themeMode: ThemeMode;

  // Alterar preferência
  setThemeMode: (mode: ThemeMode) => void;

  // Toggle simples entre light e dark
  toggleTheme: () => void;
}

// Criar contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Chave para persistência
const THEME_STORAGE_KEY = '@elosaude/theme_preference';

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Preferência do sistema
  const systemColorScheme = useColorScheme();

  // Estado da preferência do usuário
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // Carregar preferência salva
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (error) {
        console.warn('Erro ao carregar preferência de tema:', error);
      }
    };
    loadThemePreference();
  }, []);

  // Salvar preferência
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Erro ao salvar preferência de tema:', error);
    }
  };

  // Toggle simples
  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  // Calcular se está em dark mode
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Cores baseadas no tema
  const colors = useMemo(() => {
    return isDark ? DarkColors : Colors;
  }, [isDark]);

  // Valor do contexto
  const value = useMemo(
    () => ({
      colors,
      isDark,
      themeMode,
      setThemeMode,
      toggleTheme,
    }),
    [colors, isDark, themeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook para usar o tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Hook para acessar apenas as cores (conveniência)
export const useColors = () => {
  const { colors } = useTheme();
  return colors;
};

// Hook para verificar dark mode
export const useIsDark = () => {
  const { isDark } = useTheme();
  return isDark;
};

export default ThemeContext;
