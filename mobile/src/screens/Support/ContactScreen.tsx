import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Linking, Alert } from 'react-native';
import { Card, Title, Paragraph, List, Button, TextInput } from 'react-native-paper';
import { Colors } from '../../config/theme';

export default function ContactScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleCall = () => {
    Linking.openURL('tel:08007771234');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/5511999999999');
  };

  const handleEmail = () => {
    const email = 'contato@elosaude.com.br';
    const emailSubject = subject || 'Contato via App';
    const emailBody = message || '';
    Linking.openURL(`mailto:${email}?subject=${emailSubject}&body=${emailBody}`);
  };

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o assunto e a mensagem.');
      return;
    }
    handleEmail();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Entre em Contato</Title>
          <Paragraph style={styles.subtitle}>
            Estamos aqui para ajudar! Entre em contato através dos canais abaixo.
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Canais de Atendimento</Title>
          <List.Section>
            <List.Item
              title="Central de Atendimento"
              description="0800 777 1234"
              left={(props) => <List.Icon {...props} icon="phone" color={Colors.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleCall}
            />
            <List.Item
              title="WhatsApp"
              description="(11) 99999-9999"
              left={(props) => <List.Icon {...props} icon="whatsapp" color="#25D366" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleWhatsApp}
            />
            <List.Item
              title="E-mail"
              description="contato@elosaude.com.br"
              left={(props) => <List.Icon {...props} icon="email" color={Colors.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleEmail}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Enviar Mensagem</Title>
          <TextInput
            label="Assunto"
            value={subject}
            onChangeText={setSubject}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Mensagem"
            value={message}
            onChangeText={setMessage}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSendMessage}
            style={styles.button}
            icon="send"
          >
            Enviar por E-mail
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Horário de Atendimento</Title>
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Segunda a Sexta:</Paragraph>
            <Paragraph style={styles.value}>8h às 18h</Paragraph>
          </View>
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Sábados:</Paragraph>
            <Paragraph style={styles.value}>8h às 12h</Paragraph>
          </View>
          <View style={styles.infoRow}>
            <Paragraph style={styles.label}>Emergência:</Paragraph>
            <Paragraph style={[styles.value, styles.emergency]}>24 horas</Paragraph>
          </View>
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
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
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
  emergency: {
    color: '#F44336',
  },
  bottomSpace: {
    height: 20,
  },
});
