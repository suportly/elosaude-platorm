/**
 * MainNavigator - Navegação Principal
 *
 * Bottom Tab Navigation otimizada para usuários 35-65 anos:
 * - Ícones grandes (24px) com labels sempre visíveis
 * - Touch targets de 48px mínimo
 * - Feedback visual claro para item ativo
 * - Badge de notificações acessível
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, TouchableOpacity, View, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from '../config/theme';
import { CountBadge } from '../components/ui/StatusBadge';

// Screens
import DigitalCardScreen from '../screens/DigitalCard/DigitalCardScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import MoreScreen from '../screens/More/MoreScreen';
import NetworkScreen from '../screens/Network/NetworkScreen';
import ProviderDetailScreen from '../screens/Network/ProviderDetailScreen';
import InvoicesScreen from '../screens/Financial/InvoicesScreen';
import TaxStatementsScreen from '../screens/Financial/TaxStatementsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import DependentsScreen from '../screens/Dependents/DependentsScreen';
import AddDependentScreen from '../screens/Dependents/AddDependentScreen';
import DependentDetailScreen from '../screens/Dependents/DependentDetailScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import PlanDetailsScreen from '../screens/Plan/PlanDetailsScreen';
import HelpCenterScreen from '../screens/Support/HelpCenterScreen';
import ContactScreen from '../screens/Support/ContactScreen';
import TermsScreen from '../screens/Support/TermsScreen';
import PrivacyScreen from '../screens/Support/PrivacyScreen';
import AboutScreen from '../screens/Support/AboutScreen';
import HealthRecordsScreen from '../screens/Health/HealthRecordsScreen';
import VaccinationCardScreen from '../screens/Health/VaccinationCardScreen';
import GuidesStack from './GuidesStack';

const Tab = createBottomTabNavigator();

// =============================================================================
// HEADER COMPONENTS
// =============================================================================

const HeaderWithNotification = ({ navigation }: any) => {
  // Show "coming soon" alert for notifications
  const showComingSoonAlert = () => {
    Alert.alert(
      'Em Breve',
      'A funcionalidade "Notificações" estará disponível em breve. Estamos trabalhando para trazer esta novidade para você!',
      [{ text: 'Entendi', style: 'default' }]
    );
  };

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.logoContainer}>
        <Image
          source={require('../../assets/images/elosaude_logo.png')}
          style={headerStyles.logo}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={headerStyles.notificationButton}
        onPress={showComingSoonAlert}
        accessibilityLabel="Notificações"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name="bell-outline"
          size={24}
          color={Colors.text.secondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 120,
    height: 36,
  },
  notificationButton: {
    width: ComponentSizes.touchTarget,
    height: ComponentSizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});

// =============================================================================
// TAB BAR ICON COMPONENT
// =============================================================================

interface TabIconProps {
  name: string;
  nameOutline: string;
  color: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, nameOutline, color, focused }) => {
  return (
    <View style={tabIconStyles.container}>
      <MaterialCommunityIcons
        name={(focused ? name : nameOutline) as any}
        size={ComponentSizes.bottomNav.iconSize}
        color={color}
      />
      {focused && <View style={[tabIconStyles.indicator, { backgroundColor: color }]} />}
    </View>
  );
};

const tabIconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});

// =============================================================================
// MAIN NAVIGATOR
// =============================================================================

export default function MainNavigator() {
  const insets = useSafeAreaInsets();

  // Calculate safe tab bar height
  const tabBarHeight = ComponentSizes.bottomNav.height + (insets.bottom > 0 ? insets.bottom : Spacing.sm);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.main,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm,
          paddingTop: Spacing.sm,
          backgroundColor: Colors.surface.card,
          borderTopWidth: 1,
          borderTopColor: Colors.border.light,
          ...Shadows.bottomNav,
        },
        tabBarLabelStyle: {
          fontSize: ComponentSizes.bottomNav.labelSize,
          fontWeight: Typography.weights.medium,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: Spacing.xs,
        },
        headerStyle: {
          backgroundColor: Colors.surface.card,
          elevation: 4,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          borderBottomWidth: 0,
          zIndex: 10,
        },
        headerTitleStyle: {
          fontSize: Typography.sizes.h4,
          fontWeight: Typography.weights.semibold,
          color: Colors.text.primary,
        },
        headerTintColor: Colors.text.primary,
      }}
    >
      {/* Main Tabs (Visible) */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Início',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="home"
              nameOutline="home-outline"
              color={color}
              focused={focused}
            />
          ),
        })}
      />

      <Tab.Screen
        name="DigitalCard"
        component={DigitalCardScreen}
        options={({ navigation }) => ({
          title: 'Cartão',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="card-account-details"
              nameOutline="card-account-details-outline"
              color={color}
              focused={focused}
            />
          ),
        })}
      />

      <Tab.Screen
        name="Network"
        component={NetworkScreen}
        options={({ navigation }) => ({
          title: 'Rede',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="hospital-box"
              nameOutline="hospital-box-outline"
              color={color}
              focused={focused}
            />
          ),
        })}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Alert.alert(
              'Em Breve',
              'A funcionalidade "Rede Credenciada" estará disponível em breve. Estamos trabalhando para trazer esta novidade para você!',
              [{ text: 'Entendi', style: 'default' }]
            );
          },
        }}
      />

      <Tab.Screen
        name="Guides"
        component={GuidesStack}
        options={({ navigation }) => ({
          title: 'Guias',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="file-document"
              nameOutline="file-document-outline"
              color={color}
              focused={focused}
            />
          ),
        })}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Alert.alert(
              'Em Breve',
              'A funcionalidade "Guias Médicas" estará disponível em breve. Estamos trabalhando para trazer esta novidade para você!',
              [{ text: 'Entendi', style: 'default' }]
            );
          },
        }}
      />

      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={({ navigation }) => ({
          title: 'Mais',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="menu"
              nameOutline="menu"
              color={color}
              focused={focused}
            />
          ),
        })}
      />

      {/* Hidden Screens (not in tab bar) */}
      <Tab.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={({ navigation }) => ({
          title: 'Faturas',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="TaxStatements"
        component={TaxStatementsScreen}
        options={({ navigation }) => ({
          title: 'Informes IR',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={({ navigation }) => ({
          title: 'Notificações',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="ProviderDetail"
        component={ProviderDetailScreen}
        options={({ navigation }) => ({
          title: 'Detalhes do Prestador',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="Dependents"
        component={DependentsScreen}
        options={({ navigation }) => ({
          title: 'Dependentes',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="AddDependent"
        component={AddDependentScreen}
        options={({ navigation }) => ({
          title: 'Adicionar Dependente',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="DependentDetail"
        component={DependentDetailScreen}
        options={({ navigation }) => ({
          title: 'Detalhes do Dependente',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({ navigation }) => ({
          title: 'Alterar Senha',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Editar Perfil',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="PlanDetails"
        component={PlanDetailsScreen}
        options={({ navigation }) => ({
          title: 'Detalhes do Plano',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={({ navigation }) => ({
          title: 'Central de Ajuda',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={({ navigation }) => ({
          title: 'Fale Conosco',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="Terms"
        component={TermsScreen}
        options={({ navigation }) => ({
          title: 'Termos e Condições',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={({ navigation }) => ({
          title: 'Política de Privacidade',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={({ navigation }) => ({
          title: 'Sobre',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="HealthRecords"
        component={HealthRecordsScreen}
        options={({ navigation }) => ({
          title: 'Registros de Saúde',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />

      <Tab.Screen
        name="VaccinationCard"
        component={VaccinationCardScreen}
        options={({ navigation }) => ({
          title: 'Cartão de Vacinação',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null,
        })}
      />
    </Tab.Navigator>
  );
}
