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
        name="Invoices"
        component={InvoicesScreen}
        options={({ navigation }) => ({
          title: 'Faturas',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="TaxStatements"
        component={TaxStatementsScreen}
        options={({ navigation }) => ({
          title: 'Informes IR',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={({ navigation }) => ({
          title: 'Notificações',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="ProviderDetail"
        component={ProviderDetailScreen}
        options={({ navigation }) => ({
          title: 'Detalhes do Prestador',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="Dependents"
        component={DependentsScreen}
        options={({ navigation }) => ({
          title: 'Dependentes',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="AddDependent"
        component={AddDependentScreen}
        options={({ navigation }) => ({
          title: 'Adicionar Dependente',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="DependentDetail"
        component={DependentDetailScreen}
        options={({ navigation }) => ({
          title: 'Detalhes do Dependente',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({ navigation }) => ({
          title: 'Alterar Senha',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Editar Perfil',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="PlanDetails"
        component={PlanDetailsScreen}
        options={({ navigation }) => ({
          title: 'Detalhes do Plano',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={({ navigation }) => ({
          title: 'Central de Ajuda',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={({ navigation }) => ({
          title: 'Fale Conosco',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="Terms"
        component={TermsScreen}
        options={({ navigation }) => ({
          title: 'Termos e Condições',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={({ navigation }) => ({
          title: 'Política de Privacidade',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={({ navigation }) => ({
          title: 'Sobre',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="HealthRecords"
        component={HealthRecordsScreen}
        options={({ navigation }) => ({
          title: 'Registros de Saúde',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
      />
      <Tab.Screen
        name="VaccinationCard"
        component={VaccinationCardScreen}
        options={({ navigation }) => ({
          title: 'Cartão de Vacinação',
          headerTitle: () => <HeaderWithNotification navigation={navigation} />,
          tabBarButton: () => null, // Hide from tab bar
        })}
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
