import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider, ActivityIndicator, Dialog, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRemoveDependentMutation } from '../../store/services/api';
import { Beneficiary } from '../../store/services/api';

type RootStackParamList = {
  DependentDetail: { dependent: Beneficiary };
  AddDependent: { dependent: Beneficiary };
};

type DependentDetailScreenRouteProp = RouteProp<RootStackParamList, 'DependentDetail'>;
type DependentDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DependentDetailScreen = () => {
  const navigation = useNavigation<DependentDetailScreenNavigationProp>();
  const route = useRoute<DependentDetailScreenRouteProp>();
  const { dependent } = route.params;

  const [removeDependent, { isLoading: isRemoving }] = useRemoveDependentMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Helper functions
  const formatCPF = (cpf: string) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado';
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const getGenderLabel = (gender: string) => {
    const genderMap: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Feminino',
      'MALE': 'Masculino',
      'FEMALE': 'Feminino',
      'OTHER': 'Outro',
    };
    return genderMap[gender] || gender;
  };

  const getRelationshipLabel = (relationship: string) => {
    const relationshipMap: Record<string, string> = {
      'SPOUSE': 'Cônjuge',
      'CHILD': 'Filho(a)',
      'PARENT': 'Pai/Mãe',
      'SIBLING': 'Irmão(ã)',
      'OTHER': 'Outro',
    };
    return relationshipMap[relationship] || relationship;
  };

  const getRelationshipIcon = (relationship: string) => {
    const iconMap: Record<string, string> = {
      'SPOUSE': 'heart',
      'CHILD': 'baby-face',
      'PARENT': 'human-male-female',
      'SIBLING': 'account-group',
      'OTHER': 'account',
    };
    return iconMap[relationship] || 'account';
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'ACTIVE': '#4CAF50',
      'SUSPENDED': '#FF9800',
      'CANCELLED': '#F44336',
    };
    return colorMap[status] || '#9E9E9E';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Ativo',
      'SUSPENDED': 'Suspenso',
      'CANCELLED': 'Cancelado',
    };
    return statusMap[status] || status;
  };

  const handleEdit = () => {
    navigation.navigate('AddDependent', { dependent });
  };

  const handleRemove = async () => {
    try {
      await removeDependent(dependent.id).unwrap();
      setShowDeleteDialog(false);
      Alert.alert(
        'Sucesso',
        'Dependente removido com sucesso',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      setShowDeleteDialog(false);
      Alert.alert(
        'Erro',
        error?.data?.error || 'Não foi possível remover o dependente'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Card with Avatar and Status */}
        <Card style={styles.headerCard} elevation={4}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={styles.avatarContainer}>
                <Icon
                  name={getRelationshipIcon('SPOUSE')}
                  size={60}
                  color="#1976D2"
                />
              </View>
              <View style={styles.headerInfo}>
                <Title style={styles.dependentName}>{dependent.full_name}</Title>
                <Chip
                  icon="check-circle"
                  style={[styles.statusChip, { backgroundColor: getStatusColor(dependent.status) }]}
                  textStyle={styles.statusChipText}
                >
                  {getStatusLabel(dependent.status)}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Personal Information */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="account-circle" size={24} color="#1976D2" />
              <Title style={styles.sectionTitle}>Informações Pessoais</Title>
            </View>

            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>CPF</Paragraph>
              <Paragraph style={styles.value}>{formatCPF(dependent.cpf)}</Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Data de Nascimento</Paragraph>
              <Paragraph style={styles.value}>{formatDate(dependent.birth_date)}</Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Idade</Paragraph>
              <Paragraph style={styles.value}>{calculateAge(dependent.birth_date)}</Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Gênero</Paragraph>
              <Paragraph style={styles.value}>{getGenderLabel(dependent.gender)}</Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Grau de Parentesco</Paragraph>
              <Paragraph style={styles.value}>{getRelationshipLabel('SPOUSE')}</Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        {(dependent.email || dependent.phone) && (
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon name="card-account-phone" size={24} color="#1976D2" />
                <Title style={styles.sectionTitle}>Contato</Title>
              </View>

              {dependent.email && (
                <>
                  <View style={styles.infoRow}>
                    <Paragraph style={styles.label}>Email</Paragraph>
                    <Paragraph style={styles.value}>{dependent.email}</Paragraph>
                  </View>
                  {dependent.phone && <Divider style={styles.divider} />}
                </>
              )}

              {dependent.phone && (
                <View style={styles.infoRow}>
                  <Paragraph style={styles.label}>Telefone</Paragraph>
                  <Paragraph style={styles.value}>{formatPhone(dependent.phone)}</Paragraph>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Address Information */}
        {dependent.address && (
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon name="map-marker" size={24} color="#1976D2" />
                <Title style={styles.sectionTitle}>Endereço</Title>
              </View>

              <View style={styles.infoRow}>
                <Paragraph style={styles.label}>Endereço</Paragraph>
                <Paragraph style={styles.value}>{dependent.address}</Paragraph>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <Paragraph style={styles.label}>Cidade</Paragraph>
                <Paragraph style={styles.value}>{dependent.city || 'N/A'}</Paragraph>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <Paragraph style={styles.label}>Estado</Paragraph>
                <Paragraph style={styles.value}>{dependent.state || 'N/A'}</Paragraph>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <Paragraph style={styles.label}>CEP</Paragraph>
                <Paragraph style={styles.value}>
                  {dependent.zip_code ? dependent.zip_code.replace(/(\d{5})(\d{3})/, '$1-$2') : 'N/A'}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Health Plan Information */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="medical-bag" size={24} color="#1976D2" />
              <Title style={styles.sectionTitle}>Plano de Saúde</Title>
            </View>

            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Número de Matrícula</Paragraph>
              <Paragraph style={styles.value}>{dependent.registration_number}</Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Plano</Paragraph>
              <Paragraph style={styles.value}>{dependent.health_plan_name}</Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Paragraph style={styles.label}>Empresa</Paragraph>
              <Paragraph style={styles.value}>{dependent.company_name}</Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={handleEdit}
            style={styles.editButton}
          >
            Editar Dependente
          </Button>

          <Button
            mode="outlined"
            icon="delete"
            onPress={() => setShowDeleteDialog(true)}
            style={styles.deleteButton}
            buttonColor="#F44336"
            textColor="#F44336"
            loading={isRemoving}
          >
            Remover Dependente
          </Button>
        </View>

        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
            <Dialog.Icon icon="alert-circle" size={48} color="#F44336" />
            <Dialog.Title style={styles.dialogTitle}>Confirmar Remoção</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Tem certeza que deseja remover {dependent.full_name} como dependente?
              </Paragraph>
              <Paragraph style={styles.dialogWarning}>
                Esta ação não pode ser desfeita.
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDeleteDialog(false)}>Cancelar</Button>
              <Button
                onPress={handleRemove}
                textColor="#F44336"
                loading={isRemoving}
              >
                Remover
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  dependentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 24,
  },
  editButton: {
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
  dialogTitle: {
    textAlign: 'center',
  },
  dialogWarning: {
    marginTop: 8,
    color: '#F44336',
    fontStyle: 'italic',
  },
});

export default DependentDetailScreen;
