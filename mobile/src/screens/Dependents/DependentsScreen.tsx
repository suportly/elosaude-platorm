import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  FAB,
  List,
  Chip,
  ActivityIndicator,
  Button,
  IconButton,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/theme';
import { formatDate, formatCPF } from '../../utils/formatters';
import { useGetDependentsQuery, useRemoveDependentMutation } from '../../store/services/api';

// Mock data - will be replaced with real API
const mockDependents = [
  {
    id: 1,
    full_name: 'Maria Silva Santos',
    cpf: '12345678901',
    birth_date: '2010-05-15',
    gender: 'FEMALE',
    relationship: 'CHILD',
    status: 'ACTIVE',
  },
  {
    id: 2,
    full_name: 'João Silva Santos',
    cpf: '98765432100',
    birth_date: '2015-08-20',
    gender: 'MALE',
    relationship: 'CHILD',
    status: 'ACTIVE',
  },
];

export default function DependentsScreen({ navigation }: any) {
  const { data: dependents = [], isLoading, error, refetch } = useGetDependentsQuery();
  const [removeDependentMutation, { isLoading: isRemoving }] = useRemoveDependentMutation();
  const [selectedDependent, setSelectedDependent] = useState<any>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'SPOUSE':
        return 'Cônjuge';
      case 'CHILD':
        return 'Filho(a)';
      case 'PARENT':
        return 'Pai/Mãe';
      case 'SIBLING':
        return 'Irmão/Irmã';
      case 'OTHER':
        return 'Outro';
      default:
        return relationship;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'Masculino';
      case 'FEMALE':
        return 'Feminino';
      case 'OTHER':
        return 'Outro';
      default:
        return gender;
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleRemoveDependent = async () => {
    if (selectedDependent) {
      try {
        await removeDependentMutation(selectedDependent.id).unwrap();
        setShowRemoveDialog(false);
        setSelectedDependent(null);
        Alert.alert('Sucesso', 'Dependente removido com sucesso');
        refetch();
      } catch (error: any) {
        console.error('Error removing dependent:', error);
        Alert.alert('Erro', error?.data?.error || 'Erro ao remover dependente. Tente novamente.');
        setShowRemoveDialog(false);
      }
    }
  };

  const renderDependent = (dependent: any) => {
    const age = calculateAge(dependent.birth_date);
    const isActive = dependent.status === 'ACTIVE';

    return (
      <Card key={dependent.id} style={styles.dependentCard}>
        <Card.Content>
          <View style={styles.dependentHeader}>
            <View style={styles.dependentHeaderLeft}>
              <Icon
                name={dependent.gender === 'MALE' ? 'human-male' : 'human-female'}
                size={40}
                color={Colors.primary}
              />
              <View style={styles.dependentInfo}>
                <Text variant="titleMedium" style={styles.dependentName}>
                  {dependent.full_name}
                </Text>
                <View style={styles.dependentMeta}>
                  <Chip
                    style={styles.relationshipChip}
                    textStyle={{ fontSize: 12 }}
                    icon="heart"
                  >
                    {getRelationshipLabel(dependent.relationship)}
                  </Chip>
                  <Chip
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: isActive
                          ? Colors.success + '20'
                          : Colors.textSecondary + '20',
                      },
                    ]}
                    textStyle={{
                      fontSize: 12,
                      color: isActive ? Colors.success : Colors.textSecondary,
                    }}
                  >
                    {isActive ? 'Ativo' : 'Inativo'}
                  </Chip>
                </View>
              </View>
            </View>
            <IconButton
              icon="delete-outline"
              size={24}
              iconColor={Colors.error}
              onPress={() => {
                setSelectedDependent(dependent);
                setShowRemoveDialog(true);
              }}
            />
          </View>

          <View style={styles.dependentDetails}>
            <View style={styles.detailRow}>
              <Icon name="calendar" size={18} color={Colors.textSecondary} />
              <Text variant="bodyMedium" style={styles.detailText}>
                {age} anos - {formatDate(dependent.birth_date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="gender-male-female" size={18} color={Colors.textSecondary} />
              <Text variant="bodyMedium" style={styles.detailText}>
                {getGenderLabel(dependent.gender)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="card-account-details" size={18} color={Colors.textSecondary} />
              <Text variant="bodyMedium" style={styles.detailText}>
                {formatCPF(dependent.cpf)}
              </Text>
            </View>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button
            icon="pencil"
            onPress={() => navigation.navigate('AddDependent', { dependent })}
          >
            Editar
          </Button>
          <Button icon="eye" onPress={() => navigation.navigate('DependentDetail', { dependent })}>
            Ver Detalhes
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={Colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          Erro ao carregar dependentes
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoCardContent}>
            <Icon name="information-outline" size={24} color={Colors.info} />
            <View style={styles.infoTextContainer}>
              <Text variant="titleSmall" style={[styles.infoTitle, { color: Colors.info }]}>
                Gestão de Dependentes
              </Text>
              <Text variant="bodySmall" style={[styles.infoText, { color: Colors.info }]}>
                Adicione seus dependentes para que eles também tenham acesso aos benefícios do
                plano de saúde.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={styles.summaryNumber}>
                  {dependents.length}
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Dependentes
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text variant="headlineMedium" style={[styles.summaryNumber, { color: Colors.success }]}>
                  {dependents.filter((d) => d.status === 'ACTIVE').length}
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Ativos
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Dependents List */}
        {dependents.length > 0 ? (
          dependents.map((dependent) => renderDependent(dependent))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="account-multiple-outline" size={64} color={Colors.textLight} />
            <Text variant="titleMedium" style={styles.emptyText}>
              Nenhum dependente cadastrado
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Toque no botão + para adicionar um dependente
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddDependent')}
        label="Adicionar Dependente"
      />

      {/* Remove Dialog */}
      <Portal>
        <Dialog visible={showRemoveDialog} onDismiss={() => setShowRemoveDialog(false)}>
          <Dialog.Title>Remover Dependente</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Tem certeza que deseja remover {selectedDependent?.full_name} da lista de
              dependentes?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRemoveDialog(false)}>Cancelar</Button>
            <Button onPress={handleRemoveDependent} textColor={Colors.error}>
              Remover
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: Colors.info + '10',
  },
  infoCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    lineHeight: 18,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  summaryLabel: {
    marginTop: 4,
    color: Colors.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.divider,
  },
  dependentCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
  },
  dependentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dependentHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  dependentInfo: {
    flex: 1,
  },
  dependentName: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dependentMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  relationshipChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  dependentDetails: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: Colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    marginTop: 8,
    color: Colors.textLight,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});
