import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, List, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors } from '../../config/theme';

export default function PlanDetailsScreen() {
  const { beneficiary } = useSelector((state: RootState) => state.auth);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{beneficiary?.health_plan || 'Plano de Saúde'}</Title>
          <Paragraph style={styles.subtitle}>
            Informações sobre seu plano de saúde e cobertura
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Dados do Plano</Title>
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Plano:</Paragraph>
            <Paragraph style={styles.value}>{beneficiary?.health_plan || 'N/A'}</Paragraph>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Empresa:</Paragraph>
            <Paragraph style={styles.value}>{beneficiary?.company || 'N/A'}</Paragraph>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Tipo:</Paragraph>
            <Paragraph style={styles.value}>
              {beneficiary?.beneficiary_type === 'TITULAR' ? 'Titular' : 'Dependente'}
            </Paragraph>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Status:</Paragraph>
            <Paragraph style={[styles.value, styles.activeStatus]}>
              {beneficiary?.status === 'ACTIVE' ? 'Ativo' : beneficiary?.status || 'N/A'}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Cobertura</Title>
          <List.Section>
            <List.Item
              title="Consultas"
              description="Ilimitadas"
              left={(props) => <List.Icon {...props} icon="check-circle" color={Colors.primary} />}
            />
            <Divider />
            <List.Item
              title="Exames"
              description="Conforme solicitação médica"
              left={(props) => <List.Icon {...props} icon="check-circle" color={Colors.primary} />}
            />
            <Divider />
            <List.Item
              title="Internações"
              description="Cobertura completa"
              left={(props) => <List.Icon {...props} icon="check-circle" color={Colors.primary} />}
            />
            <Divider />
            <List.Item
              title="Urgência e Emergência"
              description="24 horas"
              left={(props) => <List.Icon {...props} icon="check-circle" color={Colors.primary} />}
            />
            <Divider />
            <List.Item
              title="Telemedicina"
              description="Disponível"
              left={(props) => <List.Icon {...props} icon="check-circle" color={Colors.primary} />}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Rede Credenciada</Title>
          <Paragraph style={styles.description}>
            Acesse a seção "Rede" no menu principal para ver todos os prestadores credenciados,
            incluindo hospitais, clínicas, laboratórios e profissionais de saúde.
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  divider: {
    marginVertical: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomSpace: {
    height: 20,
  },
});
