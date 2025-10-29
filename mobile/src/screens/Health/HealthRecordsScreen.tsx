import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, FAB, Text, Searchbar } from 'react-native-paper';
import { useGetHealthRecordsQuery } from '../../store/services/api';
import { Colors } from '../../config/theme';

interface HealthRecord {
  id: string;
  record_type: string;
  record_type_display: string;
  date: string;
  provider_name: string;
  professional_name: string;
  specialty: string;
  diagnosis: string;
  description: string;
  prescribed_medications: string;
}

const RECORD_TYPE_COLORS: { [key: string]: string } = {
  CONSULTATION: '#2196F3',
  EXAM: '#9C27B0',
  SURGERY: '#F44336',
  HOSPITALIZATION: '#FF9800',
  EMERGENCY: '#F44336',
  PROCEDURE: '#00BCD4',
  OTHER: '#757575',
};

export default function HealthRecordsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const { data: records, isLoading, refetch } = useGetHealthRecordsQuery({});
  
  const filteredRecords = records?.filter((record: HealthRecord) => {
    const matchesSearch = !searchQuery || 
      record.provider_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.professional_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || record.record_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const recordTypes = records ? 
    Array.from(new Set(records.map((r: HealthRecord) => r.record_type))) : [];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar registros..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {recordTypes.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <Chip
            selected={selectedType === null}
            onPress={() => setSelectedType(null)}
            style={styles.filterChip}
            mode="outlined"
          >
            Todos
          </Chip>
          {recordTypes.map((type: string) => {
            const record = records.find((r: HealthRecord) => r.record_type === type);
            return (
              <Chip
                key={type}
                selected={selectedType === type}
                onPress={() => setSelectedType(selectedType === type ? null : type)}
                style={styles.filterChip}
                mode="outlined"
              >
                {record?.record_type_display}
              </Chip>
            );
          })}
        </ScrollView>
      )}

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
        ) : filteredRecords && filteredRecords.length > 0 ? (
          filteredRecords.map((record: HealthRecord) => (
            <Card key={record.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Chip
                    style={[
                      styles.typeChip,
                      { backgroundColor: RECORD_TYPE_COLORS[record.record_type] || '#757575' }
                    ]}
                    textStyle={styles.typeChipText}
                  >
                    {record.record_type_display}
                  </Chip>
                  <Text style={styles.date}>
                    {new Date(record.date).toLocaleDateString('pt-BR')}
                  </Text>
                </View>

                {record.provider_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Local:</Text>
                    <Text style={styles.value}>{record.provider_name}</Text>
                  </View>
                )}

                {record.professional_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Profissional:</Text>
                    <Text style={styles.value}>{record.professional_name}</Text>
                  </View>
                )}

                {record.specialty && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Especialidade:</Text>
                    <Text style={styles.value}>{record.specialty}</Text>
                  </View>
                )}

                {record.diagnosis && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Diagnóstico:</Text>
                    <Text style={styles.sectionContent}>{record.diagnosis}</Text>
                  </View>
                )}

                {record.description && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descrição:</Text>
                    <Text style={styles.sectionContent}>{record.description}</Text>
                  </View>
                )}

                {record.prescribed_medications && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Medicamentos:</Text>
                    <Text style={styles.sectionContent}>{record.prescribed_medications}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedType
                ? 'Nenhum registro encontrado com os filtros aplicados'
                : 'Você ainda não possui registros de saúde'}
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchbar: {
    elevation: 2,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeChip: {
    height: 28,
  },
  typeChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
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
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  section: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionContent: {
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
  },
  bottomSpace: {
    height: 20,
  },
});
