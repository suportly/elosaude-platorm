import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { Colors } from '../../config/theme';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Termos e Condições de Uso</Title>
          <Paragraph style={styles.date}>Última atualização: 28 de Outubro de 2025</Paragraph>

          <Title style={styles.sectionTitle}>1. Aceitação dos Termos</Title>
          <Paragraph style={styles.paragraph}>
            Ao acessar e usar o aplicativo Elosaúde, você concorda em cumprir e estar sujeito aos seguintes termos e condições de uso. Se você não concordar com alguma parte destes termos, não utilize nosso aplicativo.
          </Paragraph>

          <Title style={styles.sectionTitle}>2. Uso do Aplicativo</Title>
          <Paragraph style={styles.paragraph}>
            O aplicativo Elosaúde destina-se a facilitar o acesso dos beneficiários aos serviços de saúde, permitindo consultar a rede credenciada, solicitar guias, reembolsos e gerenciar informações de saúde.
          </Paragraph>

          <Title style={styles.sectionTitle}>3. Responsabilidades do Usuário</Title>
          <Paragraph style={styles.paragraph}>
            • Manter a confidencialidade de suas credenciais de acesso{'\n'}
            • Fornecer informações verdadeiras e atualizadas{'\n'}
            • Não compartilhar sua conta com terceiros{'\n'}
            • Notificar imediatamente sobre uso não autorizado{'\n'}
            • Utilizar o aplicativo de forma legal e ética
          </Paragraph>

          <Title style={styles.sectionTitle}>4. Privacidade e Dados</Title>
          <Paragraph style={styles.paragraph}>
            Seus dados pessoais e de saúde são tratados conforme nossa Política de Privacidade, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </Paragraph>

          <Title style={styles.sectionTitle}>5. Propriedade Intelectual</Title>
          <Paragraph style={styles.paragraph}>
            Todo o conteúdo do aplicativo, incluindo textos, gráficos, logotipos e software, é propriedade da Elosaúde e está protegido por leis de direitos autorais.
          </Paragraph>

          <Title style={styles.sectionTitle}>6. Limitação de Responsabilidade</Title>
          <Paragraph style={styles.paragraph}>
            A Elosaúde não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso ou incapacidade de uso do aplicativo.
          </Paragraph>

          <Title style={styles.sectionTitle}>7. Modificações</Title>
          <Paragraph style={styles.paragraph}>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação no aplicativo.
          </Paragraph>

          <Title style={styles.sectionTitle}>8. Legislação Aplicável</Title>
          <Paragraph style={styles.paragraph}>
            Estes termos são regidos pelas leis da República Federativa do Brasil.
          </Paragraph>

          <Title style={styles.sectionTitle}>9. Contato</Title>
          <Paragraph style={styles.paragraph}>
            Para dúvidas sobre estes termos, entre em contato através da Central de Atendimento ou pelo e-mail contato@elosaude.com.br.
          </Paragraph>
        </Card.Content>
      </Card>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
});
