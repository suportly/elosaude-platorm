# Configuração do Sentry - Crash Reporting

## Status: ✅ Instalado e Configurado

O Sentry foi instalado e configurado para capturar crashes e erros no app Elosaúde.

## O que foi implementado:

### 1. Sentry SDK Instalado
- Pacote: `@sentry/react-native@5.x`
- Instalado em: `mobile/package.json`

### 2. Inicialização no App.tsx
- Configuração básica no arquivo `mobile/App.tsx`
- Environment detection (development vs production)
- Trace sample rate configurado
- Auto session tracking habilitado

### 3. Error Boundary Component
- Criado: `mobile/src/components/ErrorBoundary.tsx`
- Captura erros de React que não são capturados automaticamente
- UI amigável para o usuário quando há erro
- Logs detalhados em modo de desenvolvimento
- Integrado no App.tsx envolvendo toda a árvore de componentes

## Próximos passos para ativar:

### 1. Criar conta no Sentry.io

1. Acesse https://sentry.io/signup/
2. Crie uma conta (gratuita para até 5k eventos/mês)
3. Crie um novo projeto do tipo "React Native"
4. Copie o DSN fornecido

### 2. Configurar o DSN

Edite o arquivo `mobile/App.tsx` linha 14:

```typescript
dsn: 'https://SEU_DSN_AQUI@o123456.ingest.sentry.io/7654321',
```

Substitua `'https://your-sentry-dsn@sentry.io/your-project-id'` pelo DSN real.

### 3. (Opcional) Usar variável de ambiente

Para maior segurança, coloque o DSN em variável de ambiente:

1. Instale: `npm install react-native-config`
2. Crie arquivo `.env`:
```
SENTRY_DSN=https://seu-dsn@sentry.io/projeto-id
```
3. Atualize App.tsx:
```typescript
import Config from 'react-native-config';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  // ...
});
```

## Funcionalidades Ativas:

### ✅ Captura Automática de Erros
- JavaScript errors
- Promise rejections
- Native crashes (iOS e Android)

### ✅ Error Boundary
- Captura erros de componentes React
- UI de fallback amigável
- Botão "Tentar Novamente"

### ✅ Context Tracking
- Environment (development/production)
- Component stack traces
- User sessions

### ✅ Performance Monitoring
- Sample rate: 100% em dev, 20% em produção
- Rastreamento de transações
- Auto session tracking

## Como Testar:

### Teste 1: Error Boundary
Adicione temporariamente em qualquer screen:
```typescript
const TestCrash = () => {
  throw new Error('Teste de Error Boundary');
  return null;
};
```

### Teste 2: Erro não capturado
```typescript
setTimeout(() => {
  throw new Error('Teste de erro assíncrono');
}, 1000);
```

### Teste 3: Promise rejection
```typescript
Promise.reject('Teste de promise rejection');
```

## Visualizando Erros:

1. Acesse https://sentry.io
2. Selecione seu projeto
3. Veja erros em **Issues**
4. Sessions em **Releases**
5. Performance em **Performance**

## Configurações Avançadas (Futuro):

### Source Maps
Para ver código original nos stack traces:
```bash
npx sentry-cli sourcemaps upload --org YOUR_ORG --project YOUR_PROJECT ./dist
```

### Release Tracking
```typescript
Sentry.init({
  // ...
  release: 'elosaude-mobile@1.0.0',
  dist: '1',
});
```

### User Context
Após login, adicione contexto do usuário:
```typescript
Sentry.setUser({
  id: beneficiary.id.toString(),
  username: beneficiary.full_name,
  email: user.email,
});
```

### Breadcrumbs Customizados
```typescript
Sentry.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to Profile',
  level: 'info',
});
```

## Custo:

- **Gratuito**: Até 5,000 eventos/mês
- **Developer**: $26/mês - 50,000 eventos
- **Team**: $80/mês - 100,000 eventos

## Benefícios:

1. ✅ **Detecção precoce** de bugs em produção
2. ✅ **Stack traces** completos com source maps
3. ✅ **User context** para reproduzir problemas
4. ✅ **Alertas** via email/Slack quando há erro
5. ✅ **Releases tracking** para ver quando bugs foram introduzidos
6. ✅ **Performance monitoring** para identificar bottlenecks

## Documentação:

- Sentry React Native: https://docs.sentry.io/platforms/react-native/
- Error Boundary: https://legacy.reactjs.org/docs/error-boundaries.html
- Best Practices: https://docs.sentry.io/platforms/react-native/best-practices/
