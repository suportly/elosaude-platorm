import React from 'react';
import { View, StyleSheet, ScrollView, Linking, RefreshControl } from 'react-native';
import { Card, Title, Text, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetOracleCardsQuery } from '../../store/services/api';
import { getUserOperators } from '../../utils/cardUtils';
import { MEDICAL_GUIDE_CONFIGS } from '../../config/medicalGuides';
import type { OperatorType } from '../../types/medicalGuide';
import { Colors } from '../../config/theme';

const NetworkScreen = () => {
  const { data: oracleCards, isLoading, refetch } = useGetOracleCardsQuery();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // Get all cards and extract unique operators
  const allCards = oracleCards
    ? [
        ...oracleCards.carteirinha.map((c: any) => ({ ...c, _type: 'CARTEIRINHA' })),
        ...oracleCards.unimed.map((c: any) => ({ ...c, _type: 'UNIMED' })),
        ...oracleCards.reciprocidade.map((c: any) => ({ ...c, _type: 'RECIPROCIDADE' })),
      ]
    : [];

  const userOperators = getUserOperators(allCards);

  const handleOpenGuide = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (userOperators.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="hospital-building" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Nenhum cartão ativo</Text>
        <Text style={styles.emptySubtext}>
          Você não possui cartões ativos para acessar guias médicos
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary.main]}
          tintColor={Colors.primary.main}
        />
      }
    >
      <Text style={styles.header}>Guia Médico</Text>
      <Text style={styles.subheader}>Acesse a rede credenciada do seu plano</Text>

      {userOperators.map((operator: OperatorType) => {
        const config = MEDICAL_GUIDE_CONFIGS[operator];
        return (
          <Card
            key={operator}
            style={[styles.card, { borderLeftColor: config.color }]}
            onPress={() => handleOpenGuide(config.url)}
            accessibilityLabel={`Abrir Guia Médico ${config.name}`}
            accessibilityRole="link"
          >
            <Card.Content style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                <Icon name={config.icon} size={32} color={config.color} />
              </View>
              <View style={styles.textContainer}>
                <Title style={styles.cardTitle}>{config.name}</Title>
                <Text style={styles.cardSubtitle}>Rede Credenciada</Text>
              </View>
              <Icon name="open-in-new" size={24} color="#666" />
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
    textAlign: 'center',
  },
});

export default NetworkScreen;
