import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetReimbursementQuery } from '../../store/services/api';
import { Colors } from '../../config/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadAndSharePDF, sanitizeFilename } from '../../utils/pdfDownloader';
import { API_URL } from '../../config/api';

export default function ReimbursementDetailScreen({ route, navigation }: any) {
  const { reimbursementId } = route.params;
  const { data: reimbursement, isLoading, error, refetch } = useGetReimbursementQuery(reimbursementId);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    if (!reimbursement) {
      Alert.alert('Erro', 'Dados do reembolso não disponíveis');
      return;
    }

    setDownloading(true);

    try {
      const filename = sanitizeFilename(
        `comprovante_reembolso_${reimbursement.protocol_number}`
      );

      const pdfUrl = `${API_URL}/reimbursements/reimbursement-requests/${reimbursement.id}/receipt-pdf/`;
      await downloadAndSharePDF({
        url: pdfUrl,
        filename,
        onProgress: (progress) => {
          console.log(`Download progress: ${(progress * 100).toFixed(0)}%`);
        },
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert(
        'Erro ao Baixar',
        'Não foi possível baixar o comprovante. Tente novamente mais tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return Colors.success;
      case 'IN_ANALYSIS':
        return Colors.warning;
      case 'DENIED':
      case 'CANCELLED':
        return Colors.error;
      case 'PARTIALLY_APPROVED':
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_ANALYSIS':
        return 'Em Análise';
      case 'APPROVED':
        return 'Aprovado';
      case 'PARTIALLY_APPROVED':
        return 'Parcialmente Aprovado';
      case 'DENIED':
        return 'Negado';
      case 'PAID':
        return 'Pago';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getExpenseTypeLabel = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return 'Consulta';
      case 'EXAM':
        return 'Exame';
      case 'MEDICATION':
        return 'Medicamento';
      case 'HOSPITALIZATION':
        return 'Internação';
      case 'SURGERY':
        return 'Cirurgia';
      case 'THERAPY':
        return 'Terapia';
      case 'OTHER':
        return 'Outro';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !reimbursement) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={Colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          Erro ao carregar reembolso
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  const statusColor = getStatusColor(reimbursement.status);
  const isPaid = reimbursement.status === 'PAID';
  const isApproved = ['APPROVED', 'PARTIALLY_APPROVED', 'PAID'].includes(reimbursement.status);
  const isDenied = reimbursement.status === 'DENIED';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Status Card */}
      <Card style={[styles.statusCard, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Icon name="cash-refund" size={48} color={statusColor} />
            <View style={styles.statusInfo}>
              <Text variant="headlineSmall" style={styles.protocolNumber}>
                {reimbursement.protocol_number}
              </Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                textStyle={{ color: statusColor }}
              >
                {getStatusLabel(reimbursement.status)}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Financial Summary */}
      <Card style={styles.section}>
        <Card.Title title="Valores" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.amountRow}>
            <Text variant="bodyLarge" style={styles.amountLabel}>
              Valor Solicitado:
            </Text>
            <Text variant="headlineSmall" style={styles.requestedAmount}>
              {formatCurrency(parseFloat(reimbursement.requested_amount))}
            </Text>
          </View>

          {reimbursement.approved_amount && (
            <View style={[styles.amountRow, styles.approvedAmountRow]}>
              <Text variant="bodyLarge" style={styles.amountLabel}>
                Valor {isPaid ? 'Pago' : 'Aprovado'}:
              </Text>
              <Text variant="headlineSmall" style={[styles.approvedAmount, { color: statusColor }]}>
                {formatCurrency(parseFloat(reimbursement.approved_amount))}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Service Information */}
      <Card style={styles.section}>
        <Card.Title title="Informações do Serviço" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.infoRow}>
            <Icon name="medical-bag" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Tipo:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {getExpenseTypeLabel(reimbursement.expense_type)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Data do Atendimento:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {formatDate(reimbursement.service_date)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="hospital-building" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Prestador:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {reimbursement.provider_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="clock" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Solicitação:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {formatDate(reimbursement.created_at)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Beneficiary Information */}
      <Card style={styles.section}>
        <Card.Title title="Beneficiário" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.infoRow}>
            <Icon name="account" size={20} color={Colors.textSecondary} />
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Nome:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {reimbursement.beneficiary_name}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      {isApproved && (
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            icon="download"
            style={styles.actionButton}
            onPress={handleDownloadReceipt}
            loading={downloading}
            disabled={downloading}
          >
            {downloading ? 'Baixando...' : 'Baixar Comprovante'}
          </Button>
        </View>
      )}

      {/* Info Boxes */}
      {reimbursement.status === 'IN_ANALYSIS' && (
        <Card style={[styles.infoBox, { backgroundColor: Colors.warning + '10' }]}>
          <Card.Content style={styles.infoBoxContent}>
            <Icon name="clock-alert-outline" size={24} color={Colors.warning} />
            <Text variant="bodyMedium" style={[styles.infoBoxText, { color: Colors.warning }]}>
              Seu pedido está em análise. Você será notificado assim que houver uma atualização.
              O prazo médio de análise é de 5 dias úteis.
            </Text>
          </Card.Content>
        </Card>
      )}

      {isApproved && (
        <Card style={[styles.infoBox, { backgroundColor: Colors.success + '10' }]}>
          <Card.Content style={styles.infoBoxContent}>
            <Icon name="check-circle-outline" size={24} color={Colors.success} />
            <Text variant="bodyMedium" style={[styles.infoBoxText, { color: Colors.success }]}>
              {isPaid
                ? 'Reembolso pago! O valor foi creditado em sua conta cadastrada.'
                : 'Reembolso aprovado! O pagamento será processado em até 5 dias úteis.'}
            </Text>
          </Card.Content>
        </Card>
      )}

      {isDenied && (
        <Card style={[styles.infoBox, { backgroundColor: Colors.error + '10' }]}>
          <Card.Content style={styles.infoBoxContent}>
            <Icon name="close-circle-outline" size={24} color={Colors.error} />
            <View style={styles.infoBoxTextContainer}>
              <Text variant="bodyMedium" style={[styles.infoBoxText, { color: Colors.error }]}>
                Pedido de reembolso negado. Entre em contato com nossa central de atendimento
                para mais informações.
              </Text>
              <Button
                mode="outlined"
                style={[styles.contactButton, { borderColor: Colors.error }]}
                textColor={Colors.error}
                icon="phone"
                onPress={() => console.log('Contact support')}
              >
                Falar com Atendimento
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
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
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: Colors.error,
  },
  retryButton: {
    marginTop: 16,
  },
  statusCard: {
    margin: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusInfo: {
    flex: 1,
    gap: 8,
  },
  protocolNumber: {
    fontWeight: 'bold',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvedAmountRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  amountLabel: {
    color: Colors.textSecondary,
  },
  requestedAmount: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  approvedAmount: {
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    color: Colors.textSecondary,
    minWidth: 140,
  },
  infoValue: {
    flex: 1,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 8,
  },
  infoBox: {
    margin: 16,
    marginTop: 8,
  },
  infoBoxContent: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBoxTextContainer: {
    flex: 1,
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    lineHeight: 20,
  },
  contactButton: {
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
});
