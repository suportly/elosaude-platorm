import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Linking, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Searchbar,
  Chip,
  Button,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetProvidersQuery } from '../../store/services/api';
import { Colors } from '../../config/theme';

const NetworkScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch, isFetching } = useGetProvidersQuery({
    search: searchQuery,
    specialty: selectedSpecialty,
    page,
  });

  const providers = data?.results || [];
  const hasMore = data ? data.current_page < data.total_pages : false;

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedSpecialty]);

  const specialties = [
    'Todos',
    'Cardiologia',
    'Pediatria',
    'Ortopedia',
    'Dermatologia',
    'Ginecologia',
    'Clínico Geral',
  ];

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (provider: any) => {
    if (provider.latitude && provider.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`;
      Linking.openURL(url);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'HOSPITAL': return 'hospital-building';
      case 'DOCTOR': return 'doctor';
      case 'CLINIC': return 'hospital-box';
      case 'LABORATORY': return 'flask';
      default: return 'medical-bag';
    }
  };

  const renderProvider = ({ item }: { item: any }) => {
    const specialtyNames = item.specialties?.map((s: any) => s.name).join(', ') || '';
    
    return (
      <Card style={styles.providerCard} elevation={2}>
        <Card.Content>
          <View style={styles.providerHeader}>
            <View style={styles.providerIcon}>
              <Icon 
                name={getProviderIcon(item.provider_type)} 
                size={24} 
                color="#20a490" 
              />
            </View>
            <View style={styles.providerInfo}>
              <Title style={styles.providerName}>{item.name}</Title>
              <Paragraph style={styles.specialty}>
                {item.provider_type_display}
                {specialtyNames && ` - ${specialtyNames}`}
              </Paragraph>
            </View>
            {item.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFB300" />
                <Paragraph style={styles.rating}>{item.rating.toFixed(1)}</Paragraph>
              </View>
            )}
          </View>

          <View style={styles.providerDetails}>
            <View style={styles.detailRow}>
              <Icon name="map-marker" size={16} color="#666" />
              <Paragraph style={styles.detailText}>
                {item.city}, {item.state}
              </Paragraph>
            </View>
            <View style={styles.detailRow}>
              <Icon name="phone" size={16} color="#666" />
              <Paragraph style={styles.detailText}>{item.phone}</Paragraph>
            </View>
            {item.accepts_telemedicine && (
              <View style={styles.detailRow}>
                <Icon name="video" size={16} color="#20a490" />
                <Paragraph style={[styles.detailText, { color: '#20a490' }]}>
                  Aceita Telemedicina
                </Paragraph>
              </View>
            )}
            {item.accepts_emergency && (
              <View style={styles.detailRow}>
                <Icon name="ambulance" size={16} color="#f44336" />
                <Paragraph style={[styles.detailText, { color: '#f44336' }]}>
                  Atende Emergência
                </Paragraph>
              </View>
            )}
          </View>
        </Card.Content>

        <Card.Actions>
          <Button icon="eye" onPress={() => navigation.navigate('ProviderDetail', { providerId: item.id })}>
            Detalhes
          </Button>
          <Button icon="phone" onPress={() => handleCall(item.phone)}>
            Ligar
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#20a490" />
        <Text style={styles.loadingText}>Carregando rede credenciada...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.errorText}>Erro ao carregar prestadores</Text>
        <Text style={styles.errorSubtext}>Tente novamente mais tarde</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Buscar prestador..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {specialties.map((specialty) => (
            <Chip
              key={specialty}
              selected={selectedSpecialty === (specialty === 'Todos' ? null : specialty)}
              onPress={() =>
                setSelectedSpecialty(specialty === 'Todos' ? null : specialty)
              }
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {specialty}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {providers && providers.length > 0 ? (
        <FlatList
          data={providers}
          renderItem={renderProvider}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#20a490" />
                <Text style={styles.footerText}>Carregando mais...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.centerContainer}>
          <Icon name="hospital-building" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum prestador encontrado</Text>
          <Text style={styles.emptySubtext}>Tente ajustar os filtros de busca</Text>
        </View>
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterContainer: {
    paddingRight: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
  },
  providerCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  providerDetails: {
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
    flex: 1,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default NetworkScreen;
