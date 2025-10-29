import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Clipboard, Alert } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetInvoicesQuery, Invoice } from '../../store/services/api';
import { Colors } from '../../config/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function InvoicesScreen({ navigation }: any) {
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const { data: invoices, isLoading, error, refetch } = useGetInvoicesQuery({
    status: selectedStatus,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return Colors.warning;
      case 'PAID':
        return Colors.success;
      case 'OVERDUE':
        return Colors.error;
      case 'CANCELLED':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Em Aberto';
      case 'PAID':
        return 'Paga';
      case 'OVERDUE':
        return 'Vencida';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const copyDigitableLine = (digitableLine: string) => {
    Clipboard.setString(digitableLine);
    Alert.alert('Copiado!', 'Linha digitável copiada para a área de transferência');
  };

  const renderInvoice = (invoice: Invoice) => {
    const isOverdue = invoice.status === 'OVERDUE';
    const isPaid = invoice.status === 'PAID';

    return (
      <Card key={invoice.id} style={styles.invoiceCard}>
        <Card.Content>
          <View style={styles.invoiceHeader}>
            <View style={styles.invoiceHeaderLeft}>
              <Icon
                name={isPaid ? 'check-circle' : isOverdue ? 'alert-circle' : 'calendar-clock'}
                size={32}
                color={getStatusColor(invoice.status)}
              />
              <View style={styles.invoiceHeaderInfo}>
                <Text variant="titleMedium" style={styles.invoiceMonth}>
                  {invoice.reference_month}
                </Text>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(invoice.status) + '20' }]}
                  textStyle={{ color: getStatusColor(invoice.status), fontSize: 12 }}
                >
                  {getStatusLabel(invoice.status)}
                </Chip>
              </View>
            </View>
            <View style={styles.invoiceHeaderRight}>
              <Text variant="headlineMedium" style={styles.invoiceAmount}>
                {formatCurrency(parseFloat(invoice.amount))}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.invoiceDetails}>
            <View style={styles.detailRow}>
              <Icon name="calendar" size={20} color={Colors.textSecondary} />
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Vencimento:
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {formatDate(invoice.due_date)}
              </Text>
            </View>

            {isPaid && invoice.payment_date && (
              <View style={styles.detailRow}>
                <Icon name="check" size={20} color={Colors.success} />
                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Pagamento:
                </Text>
                <Text variant="bodyMedium" style={styles.detailValue}>
                  {formatDate(invoice.payment_date)}
                </Text>
              </View>
            )}
          </View>

          {!isPaid && (
            <>
              <View style={styles.divider} />

              <View style={styles.barcodeSection}>
                <Text variant="bodySmall" style={styles.barcodeLabel}>
                  Linha Digitável
                </Text>
                <TouchableOpacity
                  style={styles.digitableLineContainer}
                  onPress={() => copyDigitableLine(invoice.digitable_line)}
                >
                  <Text variant="bodySmall" style={styles.digitableLine}>
                    {invoice.digitable_line}
                  </Text>
                  <Icon name="content-copy" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  style={styles.actionButton}
                  icon="download"
                  onPress={() => console.log('Download PDF')}
                >
                  Baixar Boleto
                </Button>
              </View>
            </>
          )}

          {isPaid && (
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                style={styles.actionButton}
                icon="download"
                onPress={() => console.log('Download Comprovante')}
              >
                Comprovante
              </Button>
            </View>
          )}
        </Card.Content>
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
          Erro ao carregar faturas
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['Todas', 'OPEN', 'OVERDUE', 'PAID'].map((status) => (
          <Chip
            key={status}
            selected={selectedStatus === status}
            onPress={() => setSelectedStatus(status)}
            style={[
              styles.filterChip,
              selectedStatus === status && { backgroundColor: Colors.primary },
            ]}
            textStyle={[
              styles.filterChipText,
              selectedStatus === status && { color: '#FFFFFF' },
            ]}
          >
            {status === 'Todas' ? 'Todas' : getStatusLabel(status)}
          </Chip>
        ))}
      </ScrollView>

      {/* Invoices List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {invoices && invoices.length > 0 ? (
          invoices.map((invoice) => renderInvoice(invoice))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="receipt-text-outline" size={64} color={Colors.textLight} />
            <Text variant="titleMedium" style={styles.emptyText}>
              Nenhuma fatura encontrada
            </Text>
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: Colors.error,
  },
  retryButton: {
    marginTop: 16,
  },
  filterContainer: {
    maxHeight: 60,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    padding: 12,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  invoiceCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  invoiceMonth: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  invoiceHeaderRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  invoiceDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontWeight: '500',
  },
  barcodeSection: {
    gap: 8,
  },
  barcodeLabel: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  digitableLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  digitableLine: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  actionButtons: {
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.textSecondary,
  },
  bottomPadding: {
    height: 20,
  },
});
