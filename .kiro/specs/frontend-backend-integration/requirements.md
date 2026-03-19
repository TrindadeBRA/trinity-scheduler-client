# Requirements Document

## Introduction

Este documento descreve os requisitos de integração dos dois frontends do Trinity Scheduler — `trinity-scheduler-client` (frontend do cliente) e `trinity-scheduler-admin` (painel administrativo) — com o backend real `trinity-scheduler-core` (Express.js + Prisma + PostgreSQL, rodando em `http://localhost:3000`).

Atualmente ambos os frontends utilizam dados mock em `src/services/`. O objetivo é substituir todos os serviços mock por chamadas HTTP reais ao backend, respeitando as diferenças de autenticação, nomenclatura e transformação de dados entre os dois frontends.

## Glossary

- **Client_Frontend**: Aplicação React em `trinity-scheduler-client`, usada pelo cliente final para agendar serviços.
- **Admin_Frontend**: Aplicação React em `trinity-scheduler-admin`, usada pelo administrador e profissionais para gerenciar o estabelecimento.
- **Backend**: Servidor `trinity-scheduler-core` em `http://localhost:3000`.
- **HTTP_Client**: Instância configurada do `axios` ou `fetch` usada para realizar chamadas ao Backend.
- **Shop_Id**: Identificador do estabelecimento, enviado como header `X-Shop-Id` em todas as requisições do Client_Frontend.
- **JWT_Token**: Token de autenticação retornado pelo Backend no login do Admin_Frontend, enviado como `Authorization: Bearer <token>` em todas as requisições protegidas.
- **Price_Cents**: Valor monetário em centavos inteiros, conforme retornado pelo Backend.
- **Price_Reais**: Valor monetário em reais (float), conforme exibido nos frontends. Obtido dividindo Price_Cents por 100.
- **Staff**: Nomenclatura usada pelo Admin_Frontend para profissionais (`staffId`, `staffName`).
- **Professional**: Nomenclatura usada pelo Backend para profissionais (`professionalId`, `professionalName`).
- **Ref_Param**: Query parameter `?ref=` da URL do Client_Frontend, cujo valor é o Shop_Id codificado em Base64.
- **Mock_Service**: Implementação atual dos serviços em `src/services/` que retorna dados estáticos sem chamar o Backend.
- **Real_Service**: Implementação substituta dos serviços que realiza chamadas HTTP reais ao Backend.
- **Addon**: Serviço adicional opcional (tipo `addon`) retornado pelo endpoint `/addons` do Backend.
- **Dashboard**: Página de métricas do Admin_Frontend que exibe faturamento e estatísticas do dia.

---

## Requirements

### Requirement 1: Configuração do HTTP Client — Client Frontend

**User Story:** Como desenvolvedor, quero um HTTP_Client centralizado no Client_Frontend, para que todas as requisições ao Backend incluam automaticamente a URL base e o header X-Shop-Id correto.

#### Acceptance Criteria

1. THE Client_Frontend SHALL ler a URL base do Backend a partir da variável de ambiente `VITE_API_URL`.
2. THE Client_Frontend SHALL ler o Shop_Id a partir do Ref_Param da URL (`?ref=<base64>`), decodificando o valor de Base64 para obter o Shop_Id.
3. WHEN o Ref_Param não estiver presente na URL, THE Client_Frontend SHALL exibir uma mensagem de erro informando que o link de acesso é inválido e bloquear a navegação.
4. THE HTTP_Client do Client_Frontend SHALL incluir o header `X-Shop-Id` com o Shop_Id decodificado em todas as requisições ao Backend.
5. IF a variável de ambiente `VITE_API_URL` não estiver definida, THEN THE Client_Frontend SHALL lançar um erro de configuração no console e utilizar `http://localhost:3000` como valor padrão.

---

### Requirement 2: Configuração do HTTP Client — Admin Frontend

**User Story:** Como desenvolvedor, quero um HTTP_Client centralizado no Admin_Frontend, para que todas as requisições protegidas incluam automaticamente o JWT_Token e a URL base correta.

#### Acceptance Criteria

1. THE Admin_Frontend SHALL ler a URL base do Backend a partir da variável de ambiente `VITE_API_URL`.
2. THE HTTP_Client do Admin_Frontend SHALL incluir o header `Authorization: Bearer <JWT_Token>` em todas as requisições a rotas protegidas.
3. THE Admin_Frontend SHALL persistir o JWT_Token no `localStorage` após o login bem-sucedido.
4. WHEN o Admin_Frontend for inicializado, THE Admin_Frontend SHALL recuperar o JWT_Token do `localStorage` e restaurar a sessão autenticada se o token estiver presente.
5. WHEN o usuário realizar logout, THE Admin_Frontend SHALL remover o JWT_Token do `localStorage` e limpar o estado de autenticação.
6. WHEN o Backend retornar status HTTP 401, THE HTTP_Client do Admin_Frontend SHALL redirecionar o usuário para a página de login e remover o JWT_Token do `localStorage`.

---

### Requirement 3: Autenticação do Client Frontend

**User Story:** Como cliente, quero fazer login pelo meu número de telefone, para que eu possa acessar meus agendamentos.

#### Acceptance Criteria

1. WHEN o cliente submeter o formulário de login com um número de telefone, THE Client_Frontend SHALL enviar `POST /auth/login` com o body `{ "phone": "<telefone>" }` ao Backend.
2. WHEN o Backend retornar `{ "clientId": "<id>" }`, THE Client_Frontend SHALL armazenar o `clientId` no `localStorage` e atualizar o `authStore` com `isAuthenticated: true`.
3. IF o Backend retornar status HTTP 4xx ou 5xx no login, THEN THE Client_Frontend SHALL exibir uma mensagem de erro ao usuário sem alterar o estado de autenticação.
4. WHEN o Client_Frontend for inicializado com um `clientId` válido no `localStorage`, THE Client_Frontend SHALL chamar `GET /auth/validate?clientId=<id>` para verificar a validade da sessão antes de permitir acesso às páginas protegidas.
5. IF `GET /auth/validate` retornar erro, THEN THE Client_Frontend SHALL remover o `clientId` do `localStorage` e redirecionar o usuário para a página de login.

---

### Requirement 4: Autenticação do Admin Frontend

**User Story:** Como administrador, quero fazer login com email e senha, para que eu possa acessar o painel de gerenciamento.

#### Acceptance Criteria

1. WHEN o administrador submeter o formulário de login, THE Admin_Frontend SHALL enviar `POST /admin/auth/login` com `{ "email": "<email>", "password": "<senha>" }` ao Backend.
2. WHEN o Backend retornar `{ "user": {...}, "token": "<jwt>" }`, THE Admin_Frontend SHALL armazenar o JWT_Token no `localStorage`, atualizar o `userStore` com os dados do usuário e redirecionar para o Dashboard.
3. IF o Backend retornar status HTTP 401 no login, THEN THE Admin_Frontend SHALL exibir a mensagem "Credenciais inválidas" ao usuário.
4. THE Admin_Frontend SHALL enviar `POST /admin/auth/register` com os dados de `owner`, `shop` e `professional` ao Backend durante o fluxo de criação de conta.
5. THE Admin_Frontend SHALL enviar `POST /admin/auth/forgot-password` com `{ "email": "<email>" }` ao Backend durante o fluxo de recuperação de senha.

---

### Requirement 5: Listagem de Serviços e Adicionais — Client Frontend

**User Story:** Como cliente, quero ver os serviços e adicionais disponíveis, para que eu possa escolher o que desejo agendar.

#### Acceptance Criteria

1. WHEN o componente `ServiceSelection` for montado, THE Client_Frontend SHALL chamar `GET /services` ao Backend para obter a lista de serviços do tipo `service`.
2. WHEN o componente `ServiceSelection` for montado, THE Client_Frontend SHALL chamar `GET /addons` ao Backend para obter a lista de serviços do tipo `addon`.
3. WHEN o Backend retornar o campo `price` de um serviço ou adicional em Price_Cents, THE Client_Frontend SHALL converter o valor para Price_Reais dividindo por 100 antes de exibir ao usuário.
4. IF o Backend retornar erro ao buscar serviços, THEN THE Client_Frontend SHALL exibir uma mensagem de erro e oferecer opção de tentar novamente.
5. THE Client_Frontend SHALL criar o arquivo `src/services/addonService.ts` com a função `getAddons()` que chama `GET /addons` via HTTP_Client.

---

### Requirement 6: Listagem de Profissionais — Client Frontend

**User Story:** Como cliente, quero ver os profissionais disponíveis, para que eu possa escolher com quem desejo ser atendido.

#### Acceptance Criteria

1. WHEN o componente `ProfessionalSelection` for montado, THE Client_Frontend SHALL chamar `GET /professionals` ao Backend para obter a lista de profissionais ativos.
2. WHEN o Backend retornar a lista de profissionais, THE Client_Frontend SHALL exibir nome, avatar e especialidades de cada profissional.
3. IF o Backend retornar uma lista vazia, THEN THE Client_Frontend SHALL exibir a opção "Sem preferência" como única escolha disponível.

---

### Requirement 7: Disponibilidade de Horários — Client Frontend

**User Story:** Como cliente, quero ver os horários disponíveis para uma data e profissional, para que eu possa escolher o melhor horário para meu agendamento.

#### Acceptance Criteria

1. WHEN o usuário selecionar uma data no calendário, THE Client_Frontend SHALL chamar `GET /availability/slots?date=<YYYY-MM-DD>&professionalId=<id>&serviceDuration=<minutos>` ao Backend.
2. WHEN o `professionalId` for nulo (sem preferência), THE Client_Frontend SHALL omitir o parâmetro `professionalId` da query string ou enviar como vazio, conforme aceito pelo Backend.
3. WHEN o componente de calendário for montado, THE Client_Frontend SHALL chamar `GET /availability/disabled-dates?startDate=<YYYY-MM-DD>&endDate=<YYYY-MM-DD>&professionalId=<id>` ao Backend para obter as datas desabilitadas.
4. WHEN o Backend retornar os slots de disponibilidade, THE Client_Frontend SHALL exibir apenas os slots com `available: true` como selecionáveis.
5. IF o Backend retornar erro ao buscar disponibilidade, THEN THE Client_Frontend SHALL exibir uma mensagem de erro e desabilitar a seleção de horários.

---

### Requirement 8: Criação e Listagem de Agendamentos — Client Frontend

**User Story:** Como cliente, quero criar e visualizar meus agendamentos, para que eu possa gerenciar minha agenda de serviços.

#### Acceptance Criteria

1. WHEN o cliente confirmar o agendamento, THE Client_Frontend SHALL enviar `POST /appointments` com `{ clientId, serviceId, addonIds, professionalId, date, time }` ao Backend.
2. WHEN o campo `addonIds` estiver vazio, THE Client_Frontend SHALL omitir o campo ou enviar um array vazio no body da requisição.
3. WHEN o Backend retornar o agendamento criado com `price` em Price_Cents, THE Client_Frontend SHALL converter para Price_Reais antes de exibir na tela de confirmação.
4. WHEN a página de agendamentos for carregada, THE Client_Frontend SHALL chamar `GET /appointments?clientId=<id>` ao Backend para listar os agendamentos do cliente autenticado.
5. WHEN o Backend retornar agendamentos com `price` em Price_Cents, THE Client_Frontend SHALL converter todos os valores para Price_Reais antes de exibir.
6. WHEN o cliente solicitar o cancelamento de um agendamento, THE Client_Frontend SHALL enviar `PATCH /appointments/<id>/cancel` com `{ "reason": "<motivo>" }` ao Backend.
7. IF o Backend retornar erro ao criar o agendamento, THEN THE Client_Frontend SHALL exibir uma mensagem de erro e manter o usuário na tela de confirmação.

---

### Requirement 9: Conversão de Preços (Price_Cents → Price_Reais)

**User Story:** Como desenvolvedor, quero uma função utilitária de conversão de preços, para que a transformação de centavos para reais seja consistente em ambos os frontends.

#### Acceptance Criteria

1. THE Client_Frontend SHALL implementar uma função utilitária `centsToReais(cents: number): number` que retorna `cents / 100`.
2. THE Admin_Frontend SHALL implementar uma função utilitária `centsToReais(cents: number): number` que retorna `cents / 100`.
3. WHEN qualquer campo `price` ou `revenue` for recebido do Backend, THE Client_Frontend SHALL aplicar `centsToReais` antes de armazenar ou exibir o valor.
4. WHEN qualquer campo `price` ou `revenue` for recebido do Backend, THE Admin_Frontend SHALL aplicar `centsToReais` antes de armazenar ou exibir o valor.
5. WHEN o Admin_Frontend enviar um valor de preço ao Backend via POST ou PUT, THE Admin_Frontend SHALL converter o valor de Price_Reais para Price_Cents multiplicando por 100.
6. FOR ALL valores numéricos de preço, aplicar `centsToReais` e depois multiplicar por 100 SHALL retornar o valor original (propriedade de round-trip).

---

### Requirement 10: Mapeamento Staff ↔ Professional — Admin Frontend

**User Story:** Como desenvolvedor, quero um mapeamento claro entre a nomenclatura do Admin_Frontend e do Backend, para que os dados de profissionais sejam trafegados corretamente.

#### Acceptance Criteria

1. THE Admin_Frontend SHALL mapear o campo `staffId` para `professionalId` ao enviar requisições ao Backend.
2. THE Admin_Frontend SHALL mapear o campo `staffName` para `professionalName` ao enviar requisições ao Backend.
3. WHEN o Backend retornar dados com `professionalId` e `professionalName`, THE Admin_Frontend SHALL mapear para `staffId` e `staffName` antes de armazenar no estado local.
4. THE Admin_Frontend SHALL implementar funções utilitárias `toBackendProfessional(staff)` e `fromBackendProfessional(professional)` para centralizar o mapeamento.
5. WHEN o endpoint `GET /admin/appointments` retornar agendamentos com `professionalId`, THE Admin_Frontend SHALL converter para `staffId` antes de passar os dados para os componentes de UI.

---

### Requirement 11: CRUD de Profissionais (Staff) — Admin Frontend

**User Story:** Como administrador, quero gerenciar os profissionais do estabelecimento, para que eu possa manter a equipe atualizada.

#### Acceptance Criteria

1. WHEN o componente `Staff.tsx` for montado, THE Admin_Frontend SHALL chamar `GET /admin/professionals` ao Backend para listar os profissionais.
2. WHEN o administrador criar um novo profissional, THE Admin_Frontend SHALL enviar `POST /admin/professionals` com os dados mapeados de Staff para Professional ao Backend.
3. WHEN o administrador atualizar um profissional, THE Admin_Frontend SHALL enviar `PUT /admin/professionals/<id>` com os dados parciais mapeados ao Backend.
4. WHEN o administrador excluir um profissional, THE Admin_Frontend SHALL enviar `DELETE /admin/professionals/<id>` ao Backend.
5. WHEN o Backend retornar a lista de profissionais, THE Admin_Frontend SHALL mapear cada item de Professional para Staff antes de armazenar no estado.

---

### Requirement 12: CRUD de Agendamentos — Admin Frontend

**User Story:** Como administrador, quero gerenciar todos os agendamentos do estabelecimento, para que eu possa visualizar, criar, editar e cancelar atendimentos.

#### Acceptance Criteria

1. WHEN o componente `Appointments.tsx` ou `Agenda.tsx` for montado, THE Admin_Frontend SHALL chamar `GET /admin/appointments` com os filtros aplicáveis (`date`, `professionalId`, `status`, `serviceId`, `clientId`) ao Backend.
2. WHEN o filtro `staffId` for aplicado na UI, THE Admin_Frontend SHALL converter para `professionalId` antes de enviar a query string ao Backend.
3. WHEN o administrador criar um agendamento, THE Admin_Frontend SHALL enviar `POST /admin/appointments` com os campos mapeados (incluindo `professionalId` no lugar de `staffId`) ao Backend.
4. WHEN o administrador atualizar um agendamento, THE Admin_Frontend SHALL enviar `PUT /admin/appointments/<id>` ao Backend.
5. WHEN o administrador excluir um agendamento, THE Admin_Frontend SHALL enviar `DELETE /admin/appointments/<id>` ao Backend.
6. WHEN o Backend retornar agendamentos com `price` em Price_Cents, THE Admin_Frontend SHALL converter para Price_Reais antes de exibir.

---

### Requirement 13: CRUD de Clientes — Admin Frontend

**User Story:** Como administrador, quero gerenciar os clientes do estabelecimento, para que eu possa manter o cadastro atualizado.

#### Acceptance Criteria

1. WHEN o componente `Clients.tsx` for montado, THE Admin_Frontend SHALL chamar `GET /admin/clients` ao Backend, suportando os parâmetros `search`, `page` e `perPage`.
2. WHEN o administrador criar um cliente, THE Admin_Frontend SHALL enviar `POST /admin/clients` ao Backend.
3. WHEN o administrador atualizar um cliente, THE Admin_Frontend SHALL enviar `PUT /admin/clients/<id>` ao Backend.
4. WHEN o administrador excluir um cliente, THE Admin_Frontend SHALL enviar `DELETE /admin/clients/<id>` ao Backend.
5. WHEN o Backend retornar o campo `totalSpent` em Price_Cents, THE Admin_Frontend SHALL converter para Price_Reais antes de exibir.

---

### Requirement 14: CRUD de Serviços — Admin Frontend

**User Story:** Como administrador, quero gerenciar os serviços e adicionais do estabelecimento, para que eu possa manter o catálogo atualizado.

#### Acceptance Criteria

1. WHEN o componente `Services.tsx` for montado, THE Admin_Frontend SHALL chamar `GET /admin/services` ao Backend para listar serviços e adicionais.
2. WHEN o administrador criar um serviço, THE Admin_Frontend SHALL enviar `POST /admin/services` com o campo `price` em Price_Cents ao Backend.
3. WHEN o administrador atualizar um serviço, THE Admin_Frontend SHALL enviar `PUT /admin/services/<id>` com o campo `price` em Price_Cents ao Backend.
4. WHEN o administrador excluir um serviço, THE Admin_Frontend SHALL enviar `DELETE /admin/services/<id>` ao Backend.
5. WHEN o Backend retornar serviços com `price` em Price_Cents, THE Admin_Frontend SHALL converter para Price_Reais antes de exibir nos formulários e listagens.

---

### Requirement 15: CRUD de Unidades — Admin Frontend

**User Story:** Como administrador, quero gerenciar as unidades do estabelecimento, para que eu possa manter os endereços e dados de cada filial atualizados.

#### Acceptance Criteria

1. WHEN o componente `Units.tsx` for montado, THE Admin_Frontend SHALL chamar `GET /admin/units` ao Backend para listar as unidades.
2. WHEN o administrador criar uma unidade, THE Admin_Frontend SHALL enviar `POST /admin/units` ao Backend.
3. WHEN o administrador atualizar uma unidade, THE Admin_Frontend SHALL enviar `PUT /admin/units/<id>` ao Backend.
4. WHEN o administrador excluir uma unidade, THE Admin_Frontend SHALL enviar `DELETE /admin/units/<id>` ao Backend.

---

### Requirement 16: Configurações do Estabelecimento — Admin Frontend

**User Story:** Como administrador, quero visualizar e editar os dados e horários do estabelecimento, para que as informações exibidas aos clientes estejam sempre corretas.

#### Acceptance Criteria

1. WHEN o `shopStore` for inicializado após o login, THE Admin_Frontend SHALL chamar `GET /admin/shop` ao Backend para carregar os dados do estabelecimento.
2. WHEN o administrador salvar as configurações do estabelecimento, THE Admin_Frontend SHALL enviar `PUT /admin/shop` ao Backend com os dados atualizados.
3. WHEN a aba de horários for carregada, THE Admin_Frontend SHALL chamar `GET /admin/shop/hours` ao Backend.
4. WHEN o administrador salvar os horários de funcionamento, THE Admin_Frontend SHALL enviar `PUT /admin/shop/hours` ao Backend.

---

### Requirement 17: Dashboard — Admin Frontend

**User Story:** Como administrador, quero visualizar as métricas do dia e o faturamento semanal, para que eu possa acompanhar o desempenho do estabelecimento.

#### Acceptance Criteria

1. WHEN o componente `Dashboard.tsx` for montado, THE Admin_Frontend SHALL chamar `GET /admin/dashboard/stats?date=<YYYY-MM-DD>` ao Backend para obter as métricas do dia.
2. WHEN o Backend retornar o campo `revenue` em Price_Cents, THE Admin_Frontend SHALL converter para Price_Reais antes de exibir no Dashboard.
3. WHEN o componente `Dashboard.tsx` for montado, THE Admin_Frontend SHALL chamar `GET /admin/dashboard/weekly-revenue` ao Backend para obter o faturamento semanal.
4. WHEN o Backend retornar o faturamento semanal agrupado por profissional, THE Admin_Frontend SHALL renderizar o gráfico de barras com os nomes dos profissionais retornados dinamicamente, sem usar nomes fixos hardcoded.
5. WHEN o Backend retornar valores de faturamento semanal em Price_Cents, THE Admin_Frontend SHALL converter cada valor para Price_Reais antes de renderizar o gráfico.
6. IF o Backend retornar erro ao buscar as métricas do Dashboard, THEN THE Admin_Frontend SHALL exibir um estado de erro no lugar dos cards de métricas sem travar a página.

---

### Requirement 18: Substituição dos Mock Services

**User Story:** Como desenvolvedor, quero que todos os Mock_Services sejam substituídos por Real_Services, para que os frontends operem com dados reais do Backend.

#### Acceptance Criteria

1. THE Client_Frontend SHALL substituir todos os Mock_Services em `src/services/` por Real_Services que utilizam o HTTP_Client configurado.
2. THE Admin_Frontend SHALL substituir todos os Mock_Services em `src/services/` por Real_Services que utilizam o HTTP_Client configurado.
3. WHEN um Real_Service for implementado, THE Real_Service SHALL manter a mesma assinatura de função do Mock_Service correspondente para não quebrar os hooks e componentes existentes.
4. THE Client_Frontend SHALL remover todas as importações de arquivos em `src/mocks/` dos serviços após a substituição.
5. THE Admin_Frontend SHALL remover todas as importações de arquivos em `src/mocks/` dos serviços após a substituição.
6. IF um Real_Service receber uma resposta de erro do Backend, THEN THE Real_Service SHALL lançar um erro com a mensagem retornada pelo Backend para que os hooks de React Query possam tratá-lo.

---

### Requirement 19: Tratamento de Erros e Estados de Carregamento

**User Story:** Como usuário, quero receber feedback visual durante o carregamento e em caso de erros, para que eu saiba o que está acontecendo na aplicação.

#### Acceptance Criteria

1. WHILE uma requisição ao Backend estiver em andamento, THE Client_Frontend SHALL exibir um indicador de carregamento no componente correspondente.
2. WHILE uma requisição ao Backend estiver em andamento, THE Admin_Frontend SHALL exibir um indicador de carregamento no componente correspondente.
3. IF o Backend retornar status HTTP 5xx, THEN THE Client_Frontend SHALL exibir uma mensagem genérica de erro ao usuário.
4. IF o Backend retornar status HTTP 5xx, THEN THE Admin_Frontend SHALL exibir uma mensagem genérica de erro ao usuário.
5. IF o Backend retornar status HTTP 404, THEN THE Admin_Frontend SHALL exibir uma mensagem informando que o recurso não foi encontrado.
6. WHEN uma requisição de mutação (POST, PUT, PATCH, DELETE) for concluída com sucesso, THE Admin_Frontend SHALL invalidar as queries relacionadas no React Query para forçar a atualização dos dados em tela.
