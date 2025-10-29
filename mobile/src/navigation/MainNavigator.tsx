import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../config/theme';
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
import ReimbursementStack from './ReimbursementStack';
import { useGetNotificationsQuery } from '../store/services/api';
import { Badge, Text } from 'react-native-paper';

const Tab = createBottomTabNavigator();

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

// Header with logo and notification button
const HeaderWithNotification = ({ navigation }: any) => {
  const { data: notifications } = useGetNotificationsQuery({ is_read: false });
  const unreadCount = notifications?.length || 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 16, paddingVertical: 8 }}>
      <Image
        source={require('../../assets/images/elosaude_logo.png')}
        style={{
          width: 120,
          height: 35,
          resizeMode: 'contain',
        }}
      />
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative' }}>
        <Icon name="bell-outline" size={24} color={Colors.primary} />
        {unreadCount > 0 && (
          <Badge
            size={16}
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: Colors.error,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
          height: insets.bottom > 0 ? 60 + insets.bottom : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Início',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        })}
      />
      <Tab.Screen
        name="DigitalCard"
        component={DigitalCardScreen}
        options={({ navigation }) => ({
          title: 'Carteirinha',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarIcon: ({ color, size }) => (
            <Icon name="card-account-details-outline" size={size} color={color} />
          ),
        })}
      />
      <Tab.Screen
        name="Network"
        component={NetworkScreen}
        options={({ navigation }) => ({
          title: 'Rede',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarIcon: ({ color, size }) => (
            <Icon name="hospital-box-outline" size={size} color={color} />
          ),
        })}
      />
      <Tab.Screen
        name="Guides"
        component={GuidesStack}
        options={({ navigation }) => ({
          title: 'Guias',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document-outline" size={size} color={color} />
          ),
        })}
      />
      <Tab.Screen
        name="Reimbursements"
        component={ReimbursementStack}
        options={({ navigation }) => ({
          title: 'Reembolso',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash-refund" size={size} color={color} />
          ),
        })}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{
          title: 'Faturas',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="TaxStatements"
        component={TaxStatementsScreen}
        options={{
          title: 'Informes IR',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notificações',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="ProviderDetail"
        component={ProviderDetailScreen}
        options={{
          title: 'Detalhes do Prestador',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Dependents"
        component={DependentsScreen}
        options={{
          title: 'Dependentes',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="AddDependent"
        component={AddDependentScreen}
        options={{
          title: 'Adicionar Dependente',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'Alterar Senha',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Editar Perfil',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="PlanDetails"
        component={PlanDetailsScreen}
        options={{
          title: 'Detalhes do Plano',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{
          title: 'Central de Ajuda',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          title: 'Fale Conosco',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          title: 'Termos e Condições',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          title: 'Política de Privacidade',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'Sobre',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="HealthRecords"
        component={HealthRecordsScreen}
        options={{
          title: 'Registros de Saúde',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="VaccinationCard"
        component={VaccinationCardScreen}
        options={{
          title: 'Cartão de Vacinação',
          headerTitle: () => <HeaderLogo />,
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={({ navigation }) => ({
          title: 'Mais',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarIcon: ({ color, size }) => (
            <Icon name="menu" size={size} color={color} />
          ),
        })}
      />
    </Tab.Navigator>
  );
}
