import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, Text, Searchbar, Banner } from 'react-native-paper';
import { useGetVaccinationsQuery } from '../../store/services/api';
import { Colors } from '../../config/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Vaccination {
  id: string;
  vaccine_name: string;
  dose: string;
  batch_number: string;
  date_administered: string;
  next_dose_date: string | null;
  provider_name: string;
  professional_name: string;
  notes: string;
  is_due: boolean;
}

export default function VaccinationCardScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverdue, setShowOverdue] = useState(false);
  
  const { data: vaccinations, isLoading, refetch } = useGetVaccinationsQuery({});
  
  const overdueCount = vaccinations?.filter((v: Vaccination) => v.is_due).length || 0;

  const filteredVaccinations = vaccinations?.filter((vaccination: Vaccination) => {
    const matchesSearch = !searchQuery || 
      vaccination.vaccine_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vaccination.provider_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOverdue = !showOverdue || vaccination.is_due;
    
    return matchesSearch && matchesOverdue;
  });

  return (
    <View style={styles.container}>
      {overdueCount > 0 && (
        <Banner
          visible={true}
          icon="alert-circle"
          style={styles.banner}
        >
          Você tem {overdueCount} dose{overdueCount > 1 ? 's' : ''} atrasada{overdueCount > 1 ? 's' : ''}
        </Banner>
      )}

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar vacinas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.filterContainer}>
        <Chip
          selected={!showOverdue}
          onPress={() => setShowOverdue(false)}
          style={styles.filterChip}
          mode="outlined"
        >
          Todas
        </Chip>
        <Chip
          selected={showOverdue}
          onPress={() => setShowOverdue(true)}
          style={styles.filterChip}
          mode="outlined"
          icon="alert-circle"
        >
          Atrasadas ({overdueCount})
        </Chip>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <Text>Carregando...</Text>
          </View>
        ) : filteredVaccinations && filteredVaccinations.length > 0 ? (
          filteredVaccinations.map((vaccination: Vaccination) => (
            <Card 
              key={vaccination.id} 
              style={[
                styles.card,
                vaccination.is_due && styles.cardOverdue
              ]}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Icon 
                      name="needle" 
                      size={24} 
                      color={vaccination.is_due ? '#F44336' : Colors.primary} 
                    />
                    <Title style={[
                      styles.vaccineTitle,
                      vaccination.is_due && styles.vaccineTitleOverdue
                    ]}>
                      {vaccination.vaccine_name}
                    </Title>
                  </View>
                  {vaccination.is_due && (
                    <Chip
                      style={styles.overdueChip}
                      textStyle={styles.overdueChipText}
                    >
                      Atrasada
                    </Chip>
                  )}
                </View>

                {vaccination.dose && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Dose:</Text>
                    <Text style={styles.value}>{vaccination.dose}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Data de Aplicação:</Text>
                  <Text style={styles.value}>
                    {new Date(vaccination.date_administered).toLocaleDateString('pt-BR')}
                  </Text>
                </View>

                {vaccination.next_dose_date && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Próxima Dose:</Text>
                    <Text style={[
                      styles.value,
                      vaccination.is_due && styles.valueOverdue
                    ]}>
                      {new Date(vaccination.next_dose_date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}

                {vaccination.batch_number && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Lote:</Text>
                    <Text style={styles.value}>{vaccination.batch_number}</Text>
                  </View>
                )}

                {vaccination.provider_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Local:</Text>
                    <Text style={styles.value}>{vaccination.provider_name}</Text>
                  </View>
                )}

                {vaccination.professional_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Profissional:</Text>
                    <Text style={styles.value}>{vaccination.professional_name}</Text>
                  </View>
                )}

                {vaccination.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Observações:</Text>
                    <Text style={styles.notesContent}>{vaccination.notes}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="needle" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>
              {searchQuery || showOverdue
                ? 'Nenhuma vacina encontrada com os filtros aplicados'
                : 'Você ainda não possui registros de vacinação'}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  banner: {
    backgroundColor: '#FFF3E0',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchbar: {
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  cardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  vaccineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  vaccineTitleOverdue: {
    color: '#F44336',
  },
  overdueChip: {
    backgroundColor: '#F44336',
    height: 28,
  },
  overdueChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginRight: 8,
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  valueOverdue: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notesContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  bottomSpace: {
    height: 20,
  },
});
