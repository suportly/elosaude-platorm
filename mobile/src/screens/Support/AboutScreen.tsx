import React from 'react';
import { ScrollView, StyleSheet, View, Image, Linking } from 'react-native';
import { Card, Title, Paragraph, List, Button } from 'react-native-paper';
import { Colors } from '../../config/theme';

export default function AboutScreen() {
  const handleOpenWebsite = () => {
    Linking.openURL('https://elosaude.com.br');
  };

  const handleRateApp = () => {
    // Link para loja de apps
    Linking.openURL('https://play.google.com/store/apps/details?id=com.elosaude');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.centerContent}>
          <Image
            source={require('../../../assets/images/elosaude_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Title style={styles.title}>Elosaúde</Title>
          <Paragraph style={styles.version}>Versão 1.0.0</Paragraph>
          <Paragraph style={styles.subtitle}>
            Gestão de Plano de Saúde
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Sobre o Aplicativo</Title>
          <Paragraph style={styles.paragraph}>
            O aplicativo Elosaúde foi desenvolvido para facilitar o acesso dos beneficiários aos serviços de saúde, oferecendo uma plataforma completa para gestão do seu plano de saúde na palma da sua mão.
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Funcionalidades</Title>
          <List.Section>
            <List.Item
              title="Carteirinha Digital"
              description="Acesso rápido à sua carteirinha"
              left={(props) => <List.Icon {...props} icon="card-account-details" color={Colors.primary} />}
            />
            <List.Item
              title="Rede Credenciada"
              description="Busca de prestadores próximos"
              left={(props) => <List.Icon {...props} icon="hospital-box" color={Colors.primary} />}
            />
            <List.Item
              title="Guias TISS"
              description="Solicitação e acompanhamento"
              left={(props) => <List.Icon {...props} icon="file-document" color={Colors.primary} />}
            />
            <List.Item
              title="Reembolsos"
              description="Solicitação de reembolso online"
              left={(props) => <List.Icon {...props} icon="cash-refund" color={Colors.primary} />}
            />
            <List.Item
              title="Notificações"
              description="Alertas importantes em tempo real"
              left={(props) => <List.Icon {...props} icon="bell" color={Colors.primary} />}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informações</Title>
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Desenvolvido por:</Paragraph>
            <Paragraph style={styles.value}>Elosaúde Tech</Paragraph>
          </View>
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Lançamento:</Paragraph>
            <Paragraph style={styles.value}>Outubro 2025</Paragraph>
          </View>
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Suporte:</Paragraph>
            <Paragraph style={styles.value}>0800 777 1234</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleOpenWebsite}
            style={styles.button}
            icon="web"
          >
            Visitar Site
          </Button>
          <Button
            mode="outlined"
            onPress={handleRateApp}
            style={styles.button}
            icon="star"
          >
            Avaliar Aplicativo
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Paragraph style={styles.footerText}>
          © 2025 Elosaúde. Todos os direitos reservados.
        </Paragraph>
      </View>
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
  centerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 90,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
