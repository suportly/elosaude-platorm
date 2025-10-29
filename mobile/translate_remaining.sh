#!/bin/bash

# Script para completar traduções das telas restantes

echo "🌐 Traduzindo textos restantes para português..."

# ReimbursementScreen
sed -i \
  -e 's/Loading reimbursements\.\.\./Carregando reembolsos.../g' \
  -e 's/No reimbursements found/Nenhum reembolso encontrado/g' \
  -e 's/Tap the + button to request a new reimbursement/Toque no botão + para solicitar um novo reembolso/g' \
  -e 's/New Request/Nova Solicitação/g' \
  -e 's/Reimbursement Summary/Resumo de Reembolsos/g' \
  -e 's/Total Requested/Total Solicitado/g' \
  -e 's/Total Paid/Total Pago/g' \
  -e 's/Amount/Valor/g' \
  -e 's/Submitted:/Enviado:/g' \
  -e 's/Paid:/Pago:/g' \
  -e 's/Upload/Enviar/g' \
  -e 's/Receipt/Recibo/g' \
  src/screens/Reimbursement/ReimbursementScreen.tsx

# MoreScreen
sed -i \
  -e 's/Logout/Sair/g' \
  -e 's/Are you sure you want to logout?/Tem certeza que deseja sair?/g' \
  -e 's/Cancel/Cancelar/g' \
  -e 's/Edit Profile/Editar Perfil/g' \
  -e 's/My Profile/Meu Perfil/g' \
  -e 's/View and edit your personal information/Visualizar e editar suas informações pessoais/g' \
  -e 's/Dependents/Dependentes/g' \
  -e 's/Manage your dependents/Gerenciar seus dependentes/g' \
  -e 's/Change Password/Alterar Senha/g' \
  -e 's/Update your password/Atualizar sua senha/g' \
  -e 's/My Health Records/Meus Registros de Saúde/g' \
  -e 's/View your medical history/Ver seu histórico médico/g' \
  -e 's/Telemedicine/Telemedicina/g' \
  -e 's/Schedule virtual consultations/Agendar consultas virtuais/g' \
  -e 's/Vaccination Record/Cartão de Vacinação/g' \
  -e 's/View your vaccination history/Ver seu histórico de vacinações/g' \
  -e 's/Plan Details/Detalhes do Plano/g' \
  -e 's/View your plan coverage and benefits/Ver cobertura e benefícios do seu plano/g' \
  -e 's/Invoices/Faturas/g' \
  -e 's/View and download invoices/Ver e baixar faturas/g' \
  -e 's/Payment Methods/Formas de Pagamento/g' \
  -e 's/Manage payment options/Gerenciar opções de pagamento/g' \
  -e 's/Help Center/Central de Ajuda/g' \
  -e 's/FAQ and support articles/Perguntas frequentes e artigos de suporte/g' \
  -e 's/Contact Us/Fale Conosco/g' \
  -e 's/Get in touch with our team/Entre em contato com nossa equipe/g' \
  -e 's/Terms & Conditions/Termos e Condições/g' \
  -e 's/Read our terms of service/Leia nossos termos de serviço/g' \
  -e 's/Privacy Policy/Política de Privacidade/g' \
  -e 's/Learn how we protect your data/Saiba como protegemos seus dados/g' \
  -e 's/Notifications/Notificações/g' \
  -e 's/Manage notification preferences/Gerenciar preferências de notificação/g' \
  -e 's/Language/Idioma/g' \
  -e 's/Portuguese (Brazil)/Português (Brasil)/g' \
  -e 's/About/Sobre/g' \
  -e 's/Version/Versão/g' \
  src/screens/More/MoreScreen.tsx

# ProfileScreen
sed -i \
  -e 's/Loading profile\.\.\./Carregando perfil.../g' \
  -e 's/Personal Information/Informações Pessoais/g' \
  -e 's/First Name/Nome/g' \
  -e 's/Last Name/Sobrenome/g' \
  -e 's/Email/E-mail/g' \
  -e 's/Phone/Telefone/g' \
  -e 's/CPF cannot be changed/CPF não pode ser alterado/g' \
  -e 's/Address/Endereço/g' \
  -e 's/Street Address/Endereço/g' \
  -e 's/City/Cidade/g' \
  -e 's/State/Estado/g' \
  -e 's/ZIP Code/CEP/g' \
  -e 's/Emergency Contact/Contato de Emergência/g' \
  -e 's/Contact Name/Nome do Contato/g' \
  -e 's/Contact Phone/Telefone do Contato/g' \
  -e 's/Save Changes/Salvar Alterações/g' \
  -e 's/Invalid email address/Endereço de e-mail inválido/g' \
  -e 's/Phone number must have 10-11 digits/Telefone deve ter 10-11 dígitos/g' \
  -e 's/First name and last name are required/Nome e sobrenome são obrigatórios/g' \
  -e 's/Please enter a valid email address/Por favor, insira um endereço de e-mail válido/g' \
  -e 's/Please enter a valid phone number/Por favor, insira um número de telefone válido/g' \
  -e 's/Profile updated successfully/Perfil atualizado com sucesso/g' \
  -e 's/Failed to update profile/Falha ao atualizar perfil/g' \
  -e 's/Registration:/Matrícula:/g' \
  -e 's/Plan:/Plano:/g' \
  src/screens/Profile/ProfileScreen.tsx

# GuidesScreen (complemento)
sed -i \
  -e 's/Details/Detalhes/g' \
  -e 's/Download/Baixar/g' \
  -e 's/Resubmit/Reenviar/g' \
  -e 's/New Guide/Nova Guia/g' \
  -e 's/Approved/Aprovadas/g' \
  -e 's/Pending/Pendentes/g' \
  -e 's/Rejected/Rejeitadas/g' \
  -e 's/Date:/Data:/g' \
  -e 's/Auth:/Aut:/g' \
  -e 's/Valid until:/Válido até:/g' \
  src/screens/Guides/GuidesScreen.tsx

echo "✅ Traduções concluídas!"
echo ""
echo "Telas atualizadas:"
echo "  - ReimbursementScreen"
echo "  - MoreScreen"
echo "  - ProfileScreen"
echo "  - GuidesScreen (complemento)"
