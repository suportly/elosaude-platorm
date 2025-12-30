import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List, Divider, Searchbar } from 'react-native-paper';
import { Colors } from '../../config/theme';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Como faço para agendar uma consulta?',
    answer: 'Você pode agendar uma consulta através da seção "Rede" do aplicativo. Busque o prestador desejado e entre em contato diretamente através dos dados fornecidos.',
    category: 'Consultas',
  },
  {
    id: '2',
    question: 'Como solicito um reembolso?',
    answer: 'Acesse a aba "Reembolso" no menu principal, clique em "Solicitar Reembolso" e preencha os dados. Não esqueça de anexar os comprovantes necessários.',
    category: 'Reembolso',
  },
  {
    id: '3',
    question: 'Onde encontro meu cartão de saúde digital?',
    answer: 'Seu cartão de saúde digital está disponível na aba "Cartão de Saúde" do menu principal. Você pode apresentá-lo nos prestadores credenciados.',
    category: 'Cartão de Saúde',
  },
  {
    id: '4',
    question: 'Como adiciono um dependente?',
    answer: 'Vá em Mais > Dependentes > Adicionar Dependente. Preencha os dados do dependente e aguarde a aprovação.',
    category: 'Dependentes',
  },
  {
    id: '5',
    question: 'Como altero minha senha?',
    answer: 'Acesse Mais > Alterar Senha. Digite sua senha atual e a nova senha duas vezes para confirmar.',
    category: 'Conta',
  },
  {
    id: '6',
    question: 'Como faço para solicitar uma guia TISS?',
    answer: 'Acesse a aba "Guias" e clique em "Solicitar Guia". Preencha os dados do procedimento e aguarde a autorização.',
    category: 'Guias',
  },
  {
    id: '7',
    question: 'Qual o prazo para autorização de guias?',
    answer: 'O prazo médio de autorização é de 48 horas úteis. Você receberá uma notificação quando a guia for autorizada.',
    category: 'Guias',
  },
  {
    id: '8',
    question: 'Como visualizo minhas faturas?',
    answer: 'Acesse Mais > Faturas para ver todas as suas faturas. Você pode baixar o PDF de cada fatura.',
    category: 'Faturas',
  },
  {
    id: '9',
    question: 'O que fazer em caso de emergência?',
    answer: 'Em caso de emergência, dirija-se ao hospital mais próximo da rede credenciada. Seu plano cobre atendimento de urgência e emergência 24 horas.',
    category: 'Emergência',
  },
  {
    id: '10',
    question: 'Como atualizo meus dados cadastrais?',
    answer: 'Acesse Mais > Meu Perfil > Editar Perfil. Você pode atualizar telefone, email, endereço e contato de emergência.',
    category: 'Perfil',
  },
];

export default function HelpCenterScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      <Searchbar
        placeholder="Buscar perguntas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <List.Section>
        {filteredFAQ.map((item, index) => (
          <React.Fragment key={item.id}>
            <List.Accordion
              title={item.question}
              expanded={expandedId === item.id}
              onPress={() => handlePress(item.id)}
              left={(props) => <List.Icon {...props} icon="help-circle-outline" color={Colors.primary} />}
              titleStyle={styles.question}
              style={styles.accordion}
            >
              <List.Item
                title={item.answer}
                titleStyle={styles.answer}
                titleNumberOfLines={10}
                style={styles.answerContainer}
              />
            </List.Accordion>
            {index < filteredFAQ.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  accordion: {
    backgroundColor: '#FFFFFF',
  },
  question: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  answerContainer: {
    backgroundColor: '#F5F5F5',
    paddingLeft: 16,
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
