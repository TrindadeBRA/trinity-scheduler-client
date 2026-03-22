# Solução Temporária: Slug via Query Parameter

## Problema

A Vercel não suporta subdomínios wildcard em domínios `.vercel.app`, causando erro `PR_END_OF_FILE_ERROR` ao tentar acessar URLs como:
```
https://trinitybarber.tw-scheduler-client.vercel.app
```

## Solução Temporária

O sistema agora aceita o slug via query parameter como fallback:

```
https://tw-scheduler-client.vercel.app?slug=trinitybarber
```

## Como Funciona

O `slugResolver.ts` verifica na seguinte ordem de prioridade:

1. **Query parameter** `?slug=` (maior prioridade)
2. **Subdomínio** (funciona apenas com domínio customizado)

## Exemplos de Uso

### Para Testes na Vercel

```
https://tw-scheduler-client.vercel.app?slug=trinitybarber
https://tw-scheduler-client.vercel.app?slug=outroslug
```

### Com Domínio Customizado (Produção)

```
https://trinitybarber.twscheduler.com
https://outroslug.twscheduler.com
```

### Desenvolvimento Local

```
http://trinitybarber.localhost:5173
http://localhost:5173?slug=trinitybarber
```

## Gerando Links de Agendamento

No painel admin, ao gerar links de WhatsApp, use o formato com query parameter:

```typescript
const bookingUrl = `https://tw-scheduler-client.vercel.app?slug=${unit.slug}`;
```

## Migração para Produção

Quando configurar o domínio customizado com wildcard DNS:

1. Os links com subdomínio funcionarão automaticamente
2. Links antigos com `?slug=` continuarão funcionando (backward compatibility)
3. Atualize gradualmente os links para usar subdomínios

## Testando Agora

Para testar imediatamente no seu deploy da Vercel:

1. Acesse: `https://tw-scheduler-client.vercel.app?slug=trinitybarber`
2. O sistema deve:
   - Extrair o slug do query parameter
   - Chamar o backend para resolver o slug
   - Armazenar shopId e unitId no localStorage
   - Exibir a tela de login

## Próximos Passos

1. **Curto prazo**: Use `?slug=` para testes
2. **Médio prazo**: Configure domínio customizado (veja `SUBDOMAIN_SETUP.md`)
3. **Longo prazo**: Migre todos os links para subdomínios
