import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetTaxStatementsQuery, TaxStatement } from '../../store/services/api';
import { Colors } from '../../config/theme';
import { formatCurrency } from '../../utils/formatters';
import { downloadAndSharePDF, sanitizeFilename } from '../../utils/pdfDownloader';
import { API_URL } from '../../config/api';

export default function TaxStatementsScreen() {
  const { data: taxStatements, isLoading, error, refetch } = useGetTaxStatementsQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadStatement = async (statement: TaxStatement) => {
    setDownloadingId(statement.id);

    try {
      const filename = sanitizeFilename(
        `informe_rendimentos_${statement.year}`
      );

      const pdfUrl = `${API_URL}/financial/tax-statements/${statement.id}/pdf/`;
      await downloadAndSharePDF({
        url: pdfUrl,
        filename,
        onProgress: (progress) => {
          console.log(`Download progress: ${(progress * 100).toFixed(0)}%`);
        },
      });
    } catch (error) {
      console.error('Error downloading statement:', error);
      Alert.alert(
        'Erro ao Baixar',
        'Não foi possível baixar o informe. Tente novamente mais tarde.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const renderMonthlyBreakdown = (breakdown: { [key: string]: number }) => {
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    return (
      <View style={styles.monthlyBreakdown}>
        {Object.entries(breakdown)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([month, amount]) => (
            <View key={month} style={styles.monthRow}>
              <Text variant="bodyMedium" style={styles.monthLabel}>
                {monthNames[parseInt(month) - 1]}
              </Text>
              <Text variant="bodyMedium" style={styles.monthValue}>
                {formatCurrency(amount)}
              </Text>
            </View>
          ))}
      </View>
    );
  };

  const renderTaxStatement = (statement: TaxStatement) => {
    return (
      <Card key={statement.id} style={styles.statementCard}>
        <Card.Content>
          <View style={styles.statementHeader}>
            <View style={styles.statementHeaderLeft}>
              <Icon name="file-chart" size={40} color={Colors.primary} />
              <View style={styles.statementHeaderInfo}>
                <Text variant="headlineSmall" style={styles.statementYear}>
                  Ano {statement.year}
                </Text>
                <Text variant="bodySmall" style={styles.statementSubtitle}>
                  Informe de Rendimentos
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Total Pago:
              </Text>
              <Text variant="titleLarge" style={styles.summaryValue}>
                {formatCurrency(parseFloat(statement.total_paid))}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Valor Dedutível:
              </Text>
              <Text variant="titleLarge" style={[styles.summaryValue, { color: Colors.success }]}>
                {formatCurrency(parseFloat(statement.deductible_amount))}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text variant="titleSmall" style={styles.breakdownTitle}>
            Detalhamento Mensal
          </Text>
          {renderMonthlyBreakdown(statement.monthly_breakdown)}

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              style={styles.actionButton}
              icon="download"
              onPress={() => handleDownloadStatement(statement)}
              loading={downloadingId === statement.id}
              disabled={downloadingId === statement.id}
            >
              {downloadingId === statement.id ? 'Baixando...' : 'Baixar Informe'}
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              icon="share-variant"
              onPress={() => handleDownloadStatement(statement)}
              loading={downloadingId === statement.id}
              disabled={downloadingId === statement.id}
            >
              {downloadingId === statement.id ? 'Compartilhando...' : 'Compartilhar'}
            </Button>
          </View>

          <View style={styles.infoBox}>
            <Icon name="information-outline" size={20} color={Colors.info} />
            <Text variant="bodySmall" style={styles.infoText}>
              Este documento pode ser utilizado na sua declaração de Imposto de Renda
            </Text>
          </View>
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
          Erro ao carregar informes
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
        style={styles.listContainer}
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
        <View style={styles.headerSection}>
          <Icon name="file-chart-outline" size={48} color={Colors.primary} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Informes de Rendimentos
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Consulte e baixe seus informes para declaração do IR
          </Text>
        </View>

        {taxStatements && taxStatements.length > 0 ? (
          taxStatements.map((statement) => renderTaxStatement(statement))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="file-document-outline" size={64} color={Colors.textLight} />
            <Text variant="titleMedium" style={styles.emptyText}>
              Nenhum informe disponível
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Os informes são gerados anualmente em Janeiro
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
  listContainer: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginTop: 16,
  },
  headerSubtitle: {
    marginTop: 8,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statementCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  statementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statementHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statementHeaderInfo: {
    marginLeft: 16,
  },
  statementYear: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statementSubtitle: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  summarySection: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  breakdownTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  monthlyBreakdown: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  monthLabel: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  monthValue: {
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: Colors.info,
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
    height: 20,
  },
});
