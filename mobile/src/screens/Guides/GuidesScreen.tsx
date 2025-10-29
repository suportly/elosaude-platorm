import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  Paragraph,
  Text,
  Title,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetGuidesQuery } from '../../store/services/api';

const GuidesScreen = ({ navigation }: any) => {
  const [selectedStatus, setSelectedStatus] = useState('Todas');

  const { data: guides, isLoading, error } = useGetGuidesQuery({
    status: selectedStatus,
  });

  const statuses = ['Todas', 'PENDING', 'AUTHORIZED', 'DENIED', 'EXPIRED'];

  const statusLabels: { [key: string]: string } = {
    'Todas': 'Todas',
    'PENDING': 'Pendentes',
    'AUTHORIZED': 'Autorizadas',
    'DENIED': 'Negadas',
    'EXPIRED': 'Expiradas',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AUTHORIZED': return '#4CAF50';
      case 'PENDING': return '#FF9800';
      case 'DENIED': return '#F44336';
      case 'EXPIRED': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AUTHORIZED': return 'check-circle';
      case 'PENDING': return 'clock-outline';
      case 'DENIED': return 'close-circle';
      case 'EXPIRED': return 'calendar-remove';
      default: return 'file-document';
    }
  };

  const renderGuide = ({ item }: { item: any }) => (
    <Card style={styles.guideCard} elevation={2}>
      <Card.Content>
        <View style={styles.guideHeader}>
          <View style={styles.guideInfo}>
            <Title style={styles.guideNumber}>Guia {item.guide_number}</Title>
            <Paragraph style={styles.guideType}>{item.guide_type_display}</Paragraph>
          </View>
          <Chip
            icon={getStatusIcon(item.status)}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            textStyle={{ color: getStatusColor(item.status), fontSize: 11 }}
          >
            {item.status_display}
          </Chip>
        </View>

        <View style={styles.guideDetails}>
          <View style={styles.detailRow}>
            <Icon name="hospital-building" size={16} color="#666" />
            <Paragraph style={styles.detailText}>{item.provider_name}</Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color="#666" />
            <Paragraph style={styles.detailText}>
              Solicitado: {new Date(item.request_date).toLocaleDateString('pt-BR')}
            </Paragraph>
          </View>
          {item.authorization_date && (
            <View style={styles.detailRow}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Paragraph style={styles.detailText}>
                Autorizado: {new Date(item.authorization_date).toLocaleDateString('pt-BR')}
              </Paragraph>
            </View>
          )}
          {item.expiry_date && (
            <View style={styles.detailRow}>
              <Icon name="calendar-clock" size={16} color="#666" />
              <Paragraph style={styles.detailText}>
                Validade: {new Date(item.expiry_date).toLocaleDateString('pt-BR')}
              </Paragraph>
            </View>
          )}
        </View>
      </Card.Content>

      <Card.Actions>
        <Button icon="eye" onPress={() => navigation.navigate('GuideDetail', { guideId: item.id })}>
          Detalhes
        </Button>
        {item.status === 'AUTHORIZED' && (
          <Button icon="download" onPress={() => console.log('Baixar PDF', item.id)}>
            Baixar
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#20a490" />
        <Text style={styles.loadingText}>Carregando guias...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.errorText}>Erro ao carregar guias</Text>
        <Text style={styles.errorSubtext}>Tente novamente mais tarde</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      {guides && guides.length > 0 ? (
        <FlatList
          data={guides}
          renderItem={renderGuide}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Icon name="file-document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma guia encontrada</Text>
          <Text style={styles.emptySubtext}>Suas guias aparecerão aqui</Text>
        </View>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Guia"
        onPress={() => navigation.navigate("CreateGuide")}
      />
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
  guideCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guideInfo: {
    flex: 1,
  },
  guideNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  guideType: {
    fontSize: 13,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  guideDetails: {
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

export default GuidesScreen;
