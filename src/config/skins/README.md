# Sistema de Skins - Trinity Scheduler Client

Este documento descreve o sistema de temas (skins) do Trinity Scheduler Client, que permite personalizar a aparência e textos da aplicação de acordo com o nicho de mercado do estabelecimento.

## Visão Geral

O sistema de skins permite que diferentes nichos de mercado (barbearias, salões de beleza, clínicas estéticas, etc.) tenham experiências visuais e textuais personalizadas na aplicação cliente, mantendo a mesma base de código.

## Estrutura de uma Skin

Cada skin é definida por um arquivo JSON com a seguinte estrutura:

```json
{
  "metadata": {
    "nicheId": "identificador-unico",
    "displayName": "Nome Exibido",
    "description": "Descrição opcional do tema"
  },
  "colors": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": "#hexcolor",
    "background": "#hexcolor",
    "text": "#hexcolor",
    "muted": "#hexcolor",
    "border": "#hexcolor"
  },
  "texts": {
    "secao": {
      "chave": "valor"
    }
  }
}
```

## Campos Obrigatórios

### Metadata

- **nicheId** (string): Identificador único da skin (kebab-case)
- **displayName** (string): Nome amigável exibido no Admin Panel
- **description** (string, opcional): Descrição do tema

### Colors

Todas as cores devem estar no formato hexadecimal `#RRGGBB`:

- **primary**: Cor primária do tema (botões, destaques)
- **secondary**: Cor secundária (elementos de suporte)
- **accent**: Cor de destaque (hover, foco)
- **background**: Cor de fundo principal
- **text**: Cor do texto principal
- **muted**: Cor de texto secundário/desabilitado
- **border**: Cor de bordas e divisores

### Texts

Estrutura aninhada de textos personalizados. Deve incluir todas as chaves presentes em `config/texts.json`:

- `login`: Textos da tela de login
- `booking`: Textos do fluxo de agendamento
- `agendamentos`: Textos da lista de agendamentos
- `validacao`: Mensagens de validação
- `geral`: Textos gerais da aplicação

## Criando uma Nova Skin

### 1. Criar o Arquivo JSON

Crie um novo arquivo em `src/config/skins/` com o nome do nicho:

```bash
src/config/skins/meu-nicho.json
```

### 2. Definir a Estrutura

Use o template abaixo como base:

```json
{
  "metadata": {
    "nicheId": "meu-nicho",
    "displayName": "Meu Nicho",
    "description": "Tema para meu segmento de mercado"
  },
  "colors": {
    "primary": "#1a1a1a",
    "secondary": "#d4af37",
    "accent": "#8b7355",
    "background": "#ffffff",
    "text": "#1a1a1a",
    "muted": "#6b7280",
    "border": "#e5e7eb"
  },
  "texts": {
    "login": {
      "titulo": "Bem-vindo(a)",
      "subtitulo": "Informe seu telefone para continuar",
      "placeholder": "(11) 99999-9999",
      "botaoEntrar": "Entrar"
    },
    "booking": {
      "etapas": ["Serviço", "Profissional", "Data e Horário", "Confirmação"],
      "servico": {
        "titulo": "Escolha o serviço",
        "subtitulo": "Selecione o serviço que deseja agendar"
      }
      // ... copie todas as seções de texts.json
    }
  }
}
```

### 3. Validar a Skin

O sistema valida automaticamente todas as skins usando Zod. Erros de validação serão exibidos no console durante o desenvolvimento.

### 4. Registrar no Core API

Adicione o novo nicho à lista de valores válidos no Core API:

```typescript
// trinity-scheduler-core/src/routes/admin/shop.routes.ts
const VALID_NICHES = ['barbearia', 'salao-beleza', 'meu-nicho'] as const;
```

Atualize também o constraint do banco de dados:

```sql
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_niche_check";
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_niche_check" 
  CHECK ("niche" IN ('barbearia', 'salao-beleza', 'meu-nicho'));
```

## Convenções de Nomenclatura

### Cores

- Use nomes descritivos e consistentes
- Prefira cores em hexadecimal completo (#RRGGBB)
- Evite cores muito similares entre si

### Textos

- Use linguagem apropriada ao público-alvo do nicho
- Mantenha consistência de gênero (masculino/feminino)
- Adapte terminologia técnica ao contexto do nicho
- Exemplo: "serviço" (barbearia) vs "tratamento" (salão de beleza)

### Identificadores

- Use kebab-case para nicheId
- Seja descritivo mas conciso
- Evite caracteres especiais

## Sistema de Cache

O sistema implementa cache automático de 24 horas:

- Primeira carga: Busca da API + carregamento do JSON
- Cargas subsequentes: Leitura do localStorage
- Expiração: Após 24 horas, recarrega da API

Para invalidar o cache manualmente:

```typescript
import { invalidateCache } from '@/config/skins/loader';
invalidateCache();
```

## Fallback Automático

Se uma skin não puder ser carregada, o sistema automaticamente usa a skin "barbearia" como fallback. Isso garante que a aplicação sempre tenha uma aparência funcional.

## Aplicação de Cores

As cores são aplicadas como variáveis CSS no formato `--color-{key}`:

```css
:root {
  --color-primary: #1a1a1a;
  --color-secondary: #d4af37;
  /* ... */
}
```

Use no Tailwind:

```jsx
<div className="bg-[var(--color-primary)] text-[var(--color-text)]">
  Conteúdo
</div>
```

## Acesso aos Textos

Use o hook `useTexts` para acessar textos da skin:

```typescript
import { useTexts } from '@/hooks/useTexts';

function MeuComponente() {
  const { getText } = useTexts();
  
  return (
    <h1>{getText('login.titulo')}</h1>
  );
}
```

## Troubleshooting

### Skin não carrega

1. Verifique se o arquivo JSON está bem formatado
2. Confirme que todas as cores estão no formato #RRGGBB
3. Verifique o console para erros de validação
4. Confirme que o nicheId está registrado no Core API

### Cores não aplicam

1. Verifique se as variáveis CSS foram definidas
2. Confirme que está usando o formato correto no Tailwind
3. Limpe o cache do navegador

### Textos não aparecem

1. Verifique se a chave existe no arquivo JSON
2. Confirme que está usando o path correto (ex: "booking.servico.titulo")
3. Verifique se há fallback em `config/texts.json`

## Exemplos

### Tema Claro vs Escuro

**Barbearia (Escuro):**
```json
{
  "colors": {
    "background": "#121212",
    "text": "#ebebeb"
  }
}
```

**Salão de Beleza (Claro):**
```json
{
  "colors": {
    "background": "#ffffff",
    "text": "#1a1a1a"
  }
}
```

### Personalização de Linguagem

**Masculino (Barbearia):**
```json
{
  "texts": {
    "login": {
      "titulo": "Bem-vindo"
    },
    "booking": {
      "profissional": {
        "titulo": "Escolha o profissional"
      }
    }
  }
}
```

**Feminino (Salão):**
```json
{
  "texts": {
    "login": {
      "titulo": "Bem-vinda"
    },
    "booking": {
      "profissional": {
        "titulo": "Escolha a profissional"
      }
    }
  }
}
```

## Manutenção

Ao adicionar novos textos ao sistema:

1. Adicione a chave em `config/texts.json`
2. Atualize todas as skins existentes com a nova chave
3. Execute os testes para validar consistência
4. Documente a nova chave neste README

## Testes

Execute os testes de validação:

```bash
npm test -- src/config/skins
```

Isso validará:
- Estrutura de todos os arquivos JSON
- Formato das cores
- Presença de campos obrigatórios
- Consistência entre skins
