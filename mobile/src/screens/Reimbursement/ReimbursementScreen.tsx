import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  FAB,
  ActivityIndicator,
  Text,
  Divider,
  Provider as PaperProvider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetReimbursementsQuery, useGetReimbursementSummaryQuery } from '../../store/services/api';
import { Colors } from '../../config/theme';
import AddDocumentsModal from './AddDocumentsModal';

const ReimbursementScreen = ({ navigation }: any) => {
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const [addDocsModalVisible, setAddDocsModalVisible] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState<{ id: number; protocol: string } | null>(null);

  const { data, isLoading, error, refetch } = useGetReimbursementsQuery({
    status: selectedStatus,
  });

  const reimbursements = data?.results || [];

  const { data: summary, refetch: refetchSummary } = useGetReimbursementSummaryQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchSummary()]);
    } finally {
      setRefreshing(false);
    }
  };

  const statuses = ['Todos', 'IN_ANALYSIS', 'APPROVED', 'DENIED', 'PAID'];

  const statusLabels: { [key: string]: string } = {
    'Todos': 'Todos',
    'IN_ANALYSIS': 'Em Análise',
    'APPROVED': 'Aprovados',
    'DENIED': 'Negados',
    'PAID': 'Pagos',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': case 'PAID': return '#4CAF50';
      case 'IN_ANALYSIS': return '#FF9800';
      case 'DENIED': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'check-circle';
      case 'PAID': return 'cash-check';
      case 'IN_ANALYSIS': return 'clock-outline';
      case 'DENIED': return 'close-circle';
      default: return 'file-document';
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderSummary = () => {
    if (!summary) return null;

    return (
      <Card style={styles.summaryCard} elevation={2}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Resumo de Reembolsos</Title>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Icon name="cash-multiple" size={24} color="#20a490" />
              <Paragraph style={styles.summaryLabel}>Total Solicitado</Paragraph>
              <Title style={[styles.summaryValue, { color: '#20a490' }]}>
                {formatCurrency(summary.total_requested)}
              </Title>
            </View>
            <Divider style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Icon name="cash-check" size={24} color="#4CAF50" />
              <Paragraph style={styles.summaryLabel}>Total Pago</Paragraph>
              <Title style={[styles.summaryValue, { color: '#4CAF50' }]}>
                {formatCurrency(summary.total_approved)}
              </Title>
            </View>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{summary.pending_count}</Text>
              <Text style={styles.statLabel}>Em Análise</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{summary.approved_count}</Text>
              <Text style={styles.statLabel}>Aprovados</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderReimbursement = ({ item }: { item: any }) => (
    <Card style={styles.reimbursementCard} elevation={2}>
      <Card.Content>
        <View style={styles.reimbursementHeader}>
          <View style={styles.reimbursementInfo}>
            <Title style={styles.protocol}>Protocolo {item.protocol_number}</Title>
            <Paragraph style={styles.expenseType}>{item.expense_type_display}</Paragraph>
          </View>
          <Chip
            icon={getStatusIcon(item.status)}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            textStyle={{ color: getStatusColor(item.status), fontSize: 11 }}
          >
            {item.status_display}
          </Chip>
        </View>

        <View style={styles.reimbursementDetails}>
          <View style={styles.detailRow}>
            <Icon name="hospital-building" size={16} color="#666" />
            <Paragraph style={styles.detailText}>{item.provider_name}</Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color="#666" />
            <Paragraph style={styles.detailText}>
              Serviço: {new Date(item.service_date).toLocaleDateString('pt-BR')}
            </Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Icon name="cash" size={16} color="#666" />
            <Paragraph style={styles.detailText}>
              Solicitado: {formatCurrency(item.requested_amount)}
            </Paragraph>
          </View>
          {item.approved_amount && (
            <View style={styles.detailRow}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Paragraph style={[styles.detailText, { color: '#4CAF50', fontWeight: 'bold' }]}>
                Aprovado: {formatCurrency(item.approved_amount)}
              </Paragraph>
            </View>
          )}
        </View>
      </Card.Content>

      <Card.Actions>
        <Button icon="eye" onPress={() => navigation.navigate('ReimbursementDetail', { reimbursementId: item.id })}>
          Detalhes
        </Button>
        {item.status === 'IN_ANALYSIS' && (
          <Button
            icon="file-upload"
            onPress={() => {
              setSelectedReimbursement({ id: item.id, protocol: item.protocol_number });
              setAddDocsModalVisible(true);
            }}
          >
            Enviar docs
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#20a490" />
        <Text style={styles.loadingText}>Carregando reembolsos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.errorText}>Erro ao carregar reembolsos</Text>
        <Text style={styles.errorSubtext}>Tente novamente mais tarde</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary.main]}
            tintColor={Colors.primary.main}
          />
        }
      >
        {renderSummary()}
        
        <View style={styles.filterSection}>
          <FlatList
            horizontal
            data={statuses}
            renderItem={({ item }) => (
              <Chip
                key={item}
                selected={selectedStatus === item}
                onPress={() => setSelectedStatus(item)}
                style={styles.chip}
                textStyle={styles.chipText}
              >
                {statusLabels[item]}
              </Chip>
            )}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          />
        </View>

        {reimbursements && reimbursements.length > 0 ? (
          <View style={styles.listContainer}>
            {reimbursements.map((item: any) => (
              <View key={item.id}>
                {renderReimbursement({ item })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Icon name="cash-refund" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum reembolso encontrado</Text>
            <Text style={styles.emptySubtext}>Suas solicitações aparecerão aqui</Text>
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Solicitação"
        onPress={() => navigation.navigate("CreateReimbursement")}
      />

      {selectedReimbursement && (
        <AddDocumentsModal
          visible={addDocsModalVisible}
          onDismiss={() => {
            setAddDocsModalVisible(false);
            setSelectedReimbursement(null);
          }}
          reimbursementId={selectedReimbursement.id}
          protocolNumber={selectedReimbursement.protocol}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#20a490',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
  },
  chip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  reimbursementCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  reimbursementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reimbursementInfo: {
    flex: 1,
  },
  protocol: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expenseType: {
    fontSize: 13,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  reimbursementDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#20a490',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
});

export default ReimbursementScreen;
