import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../../store/hooks';

interface ModuleCardProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

function ModuleCard({ title, icon, color, onPress }: ModuleCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.moduleCard}>
      <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon size={56} icon={icon} style={{ backgroundColor: color }} />
          <Text variant="titleMedium" style={styles.cardTitle}>
            {title}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

interface QuickLinkProps {
  title: string;
  icon: string;
  onPress: () => void;
}

function QuickLink({ title, icon, onPress }: QuickLinkProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.quickLink}>
      <Icon name={icon} size={24} color="#1976D2" />
      <Text variant="bodySmall" style={styles.quickLinkText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { beneficiary } = useAppSelector((state) => state.auth);

  return (
    <ScrollView style={styles.container}>
      {/* Main Modules Grid */}
      <View style={styles.modulesContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Módulos Principais
        </Text>

        <View style={styles.grid}>
          <ModuleCard
            title="Carteirinha Digital"
            icon="card-account-details"
            color="#1976D2"
            onPress={() => navigation.navigate('DigitalCard')}
          />
          <ModuleCard
            title="Rede Credenciada"
            icon="hospital-building"
            color="#4CAF50"
            onPress={() => navigation.navigate('Network')}
          />
          <ModuleCard
            title="Guia Médico"
            icon="file-document-multiple"
            color="#FF9800"
            onPress={() => navigation.navigate('Guides')}
          />
          <ModuleCard
            title="Reembolso"
            icon="cash-refund"
            color="#9C27B0"
            onPress={() => navigation.navigate('Reimbursements')}
          />
        </View>
      </View>

      {/* Quick Links */}
      <View style={styles.quickLinksContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Atalhos Rápidos
        </Text>

        <View style={styles.quickLinksGrid}>
          <QuickLink
            title="2ª Via de Boleto"
            icon="file-download-outline"
            onPress={() => navigation.navigate('Invoices')}
          />
          <QuickLink
            title="Demonstrativo IR"
            icon="file-chart-outline"
            onPress={() => navigation.navigate('TaxStatements')}
          />
          <QuickLink
            title="Posição Financeira"
            icon="currency-usd"
            onPress={() => navigation.navigate('Invoices')}
          />
          <QuickLink
            title="Telemedicina 24h"
            icon="video-outline"
            onPress={() => console.log('Telemedicina')}
          />
        </View>
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoHeader}>
            <Icon name="information-outline" size={24} color="#1976D2" />
            <Text variant="titleSmall" style={styles.infoTitle}>
              Seu Plano
            </Text>
          </View>
          <Text variant="bodyMedium">
            {beneficiary?.health_plan || 'Plano Básico'}
          </Text>
          <Text variant="bodySmall" style={styles.infoSubtitle}>
            Status: {beneficiary?.status === 'ACTIVE' ? 'Ativo' : beneficiary?.status}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subGreeting: {
    color: '#E3F2FD',
    marginTop: 4,
  },
  modulesContainer: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardTitle: {
    marginTop: 12,
    textAlign: 'center',
  },
  quickLinksContainer: {
    padding: 16,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickLink: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
  },
  quickLinkText: {
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    margin: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    marginTop: 4,
    color: '#757575',
  },
});
