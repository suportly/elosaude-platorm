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
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text variant="headlineSmall" style={styles.welcomeText}>
          Olá, {beneficiary?.full_name?.split(' ')[0] || 'Beneficiário'}
        </Text>
        <Text variant="bodyMedium" style={styles.welcomeSubtext}>
          Bem-vindo ao seu plano de saúde
        </Text>
      </View>

      {/* Main Modules Grid - 2x2 Complete */}
      <View style={styles.modulesContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Acesso Rápido
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
            title="Guias Médicas"
            icon="file-document-multiple"
            color="#FF9800"
            onPress={() => navigation.navigate('Guides')}
          />
          <ModuleCard
            title="Minha Saúde"
            icon="heart-pulse"
            color="#E91E63"
            onPress={() => navigation.navigate('HealthRecords')}
          />
        </View>
      </View>

      {/* Plan Status Card - Enhanced */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <View style={styles.statusHeaderLeft}>
              <Icon name="shield-check" size={28} color="#4CAF50" />
              <View style={styles.statusHeaderText}>
                <Text variant="titleMedium" style={styles.statusTitle}>
                  {beneficiary?.health_plan || 'Plano Básico'}
                </Text>
                <Text variant="bodySmall" style={styles.statusSubtitle}>
                  Matrícula: {beneficiary?.registration_number}
                </Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text variant="labelSmall" style={styles.statusBadgeText}>
                {beneficiary?.status === 'ACTIVE' ? 'ATIVO' : beneficiary?.status}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions - 4 useful shortcuts */}
      <View style={styles.quickActionsContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Serviços
        </Text>

        <View style={styles.quickLinksGrid}>
          <QuickLink
            title="2ª Via de Boleto"
            icon="file-download-outline"
            onPress={() => navigation.navigate('Invoices')}
          />
          <QuickLink
            title="Informe de IR"
            icon="file-chart-outline"
            onPress={() => navigation.navigate('TaxStatements')}
          />
          <QuickLink
            title="Dependentes"
            icon="account-group"
            onPress={() => navigation.navigate('Dependents')}
          />
          <QuickLink
            title="Alterar Senha"
            icon="lock-reset"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>
      </View>

      {/* Help Card */}
      <Card style={styles.helpCard}>
        <Card.Content>
          <View style={styles.helpContent}>
            <Icon name="help-circle-outline" size={32} color="#1976D2" />
            <View style={styles.helpText}>
              <Text variant="titleSmall" style={styles.helpTitle}>
                Precisa de Ajuda?
              </Text>
              <Text variant="bodySmall" style={styles.helpSubtitle}>
                Nossa central de atendimento está disponível
              </Text>
            </View>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => navigation.navigate('Contact')}
            >
              <Text variant="labelMedium" style={styles.helpButtonText}>
                Contato
              </Text>
            </TouchableOpacity>
          </View>
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
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  welcomeSubtext: {
    color: '#757575',
    marginTop: 4,
  },
  modulesContainer: {
    padding: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#212121',
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
    elevation: 3,
    borderRadius: 12,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardTitle: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  statusCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontWeight: 'bold',
    color: '#212121',
  },
  statusSubtitle: {
    color: '#757575',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    padding: 16,
    paddingTop: 8,
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
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  quickLinkText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  helpCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 24,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  helpSubtitle: {
    color: '#424242',
    marginTop: 2,
  },
  helpButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
