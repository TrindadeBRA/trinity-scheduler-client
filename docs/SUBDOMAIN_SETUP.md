# Configuração de Subdomínios na Vercel

## Problema

A Vercel não suporta subdomínios wildcard em domínios `.vercel.app`. URLs como `trinitybarber.tw-scheduler-client.vercel.app` não funcionam.

## Solução: Domínio Customizado

### Passo 1: Adquirir um Domínio

Compre um domínio (ex: `twscheduler.com`) em qualquer registrador (Namecheap, GoDaddy, Cloudflare, etc.)

### Passo 2: Configurar DNS Wildcard

No painel do seu registrador de domínio, adicione um registro DNS:

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: Auto ou 3600
```

Isso permite que qualquer subdomínio (ex: `trinitybarber.twscheduler.com`) aponte para a Vercel.

### Passo 3: Adicionar Domínio na Vercel

1. Acesse o projeto na Vercel
2. Vá em **Settings** → **Domains**
3. Adicione o domínio wildcard: `*.twscheduler.com`
4. Adicione também o domínio raiz: `twscheduler.com`
5. Aguarde a verificação DNS (pode levar até 48h, geralmente alguns minutos)

### Passo 4: Testar

Após a configuração, teste:
- `https://trinitybarber.twscheduler.com` → deve funcionar
- `https://outroslug.twscheduler.com` → deve funcionar
- `https://twscheduler.com` → deve mostrar a home page

## Alternativa para Desenvolvimento: Localhost

Para testes locais, use subdomínios no localhost:

1. Edite `/etc/hosts` (Linux/Mac) ou `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 trinitybarber.localhost
127.0.0.1 outroslug.localhost
```

2. Acesse `http://trinitybarber.localhost:5173`

## Alternativa Temporária: Query Parameter

Se não puder usar domínio customizado imediatamente, modifique o código para aceitar slug via query parameter:

```
https://tw-scheduler-client.vercel.app?slug=trinitybarber
```

Veja `QUERY_PARAM_FALLBACK.md` para implementação.
