# Documento de Requisitos — Trinity Scheduler Core Backend

## Introdução

O Trinity Scheduler Core é o backend centralizado da aplicação Trinity Scheduler, responsável por servir dois frontends: o **trinity-scheduler-client** (painel do cliente para agendamentos) e o **trinity-scheduler-admin** (painel administrativo para gestão do estabelecimento). O backend é construído com Express.js, Prisma ORM e PostgreSQL, expondo uma API REST que cobre autenticação, gestão de serviços, profissionais, agendamentos, clientes, unidades, estabelecimento e dashboard de métricas.

## Glossário

- **API**: Interface de programação de aplicações REST exposta pelo backend
- **Cliente**: Pessoa que agenda serviços pelo painel do cliente (trinity-scheduler-client)
- **Admin**: Dono do estabelecimento com acesso total ao painel administrativo
- **Staff**: Profissional do estabelecimento com acesso restrito à própria agenda e dados no painel administrativo
- **Estabelecimento (Shop)**: Negócio cadastrado na plataforma (ex: barbearia, salão)
- **Serviço (Service)**: Serviço oferecido pelo estabelecimento (ex: Corte Masculino)
- **Adicional (Addon)**: Serviço complementar opcional ao serviço principal (ex: Sobrancelha)
- **Profissional (Professional/Staff)**: Pessoa que executa os serviços no estabelecimento
- **Agendamento (Appointment)**: Reserva de horário de um cliente com um profissional para um serviço
- **Unidade (Unit)**: Filial ou localização física do estabelecimento
- **Slot**: Intervalo de horário disponível para agendamento
- **JWT**: JSON Web Token utilizado para autenticação do painel administrativo
- **Prisma_ORM**: Ferramenta de mapeamento objeto-relacional para acesso ao PostgreSQL
- **Servidor_API**: Aplicação Express.js que processa as requisições HTTP

## Requisitos

### Requisito 1: Autenticação do Cliente por Telefone

**User Story:** Como cliente, quero me autenticar usando meu número de telefone, para que eu possa acessar meus agendamentos de forma simples.

#### Critérios de Aceitação

1. WHEN um número de telefone válido é enviado via POST /auth/login, THE Servidor_API SHALL retornar o identificador do cliente (clientId) correspondente
2. WHEN um número de telefone não cadastrado é enviado via POST /auth/login, THE Servidor_API SHALL criar um novo registro de cliente e retornar o clientId gerado
3. IF o campo "phone" estiver ausente ou vazio na requisição, THEN THE Servidor_API SHALL retornar status 400 com mensagem de erro descritiva

---

### Requisito 2: Autenticação do Admin/Staff por Email e Senha

**User Story:** Como admin ou staff, quero me autenticar com email e senha, para que eu possa acessar o painel administrativo com segurança.

#### Critérios de Aceitação

1. WHEN credenciais válidas (email e senha) são enviadas via POST /admin/auth/login, THE Servidor_API SHALL retornar os dados do usuário (name, email, avatar, role) e um token JWT válido
2. IF o email não estiver cadastrado ou a senha estiver incorreta, THEN THE Servidor_API SHALL retornar status 401 com mensagem de erro genérica
3. THE Servidor_API SHALL incluir o campo "role" (admin ou staff) no payload do JWT gerado
4. THE Servidor_API SHALL armazenar senhas utilizando hash bcrypt com salt

---

### Requisito 3: Registro de Conta (Admin + Estabelecimento)

**User Story:** Como novo dono de estabelecimento, quero criar minha conta junto com os dados do meu negócio, para que eu possa começar a usar a plataforma.

#### Critérios de Aceitação

1. WHEN dados válidos de owner, shop e professional são enviados via POST /admin/auth/register, THE Servidor_API SHALL criar o usuário admin, o estabelecimento e o primeiro profissional em uma única transação e retornar status 201
2. IF o email do owner já estiver cadastrado, THEN THE Servidor_API SHALL retornar status 409 com mensagem indicando duplicidade
3. IF algum campo obrigatório estiver ausente (name, email, password do owner; name do shop), THEN THE Servidor_API SHALL retornar status 400 com detalhes dos campos inválidos
4. IF ocorrer erro durante a transação de registro, THEN THE Servidor_API SHALL reverter todas as operações (rollback) e retornar status 500

---

### Requisito 4: Recuperação de Senha

**User Story:** Como admin ou staff, quero solicitar a redefinição da minha senha, para que eu possa recuperar o acesso à minha conta.

#### Critérios de Aceitação

1. WHEN um email cadastrado é enviado via POST /admin/auth/forgot-password, THE Servidor_API SHALL gerar um token de redefinição e retornar status 200
2. WHEN um email não cadastrado é enviado via POST /admin/auth/forgot-password, THE Servidor_API SHALL retornar status 200 (para não revelar existência de contas)
3. THE Servidor_API SHALL gerar tokens de redefinição com validade máxima de 1 hora

---

### Requisito 5: Gestão do Estabelecimento (Shop)

**User Story:** Como admin, quero visualizar e atualizar os dados do meu estabelecimento, para que as informações estejam sempre corretas.

#### Critérios de Aceitação

1. WHEN uma requisição GET /admin/shop é feita por um admin autenticado, THE Servidor_API SHALL retornar os dados do estabelecimento (name, phone, email, address)
2. WHEN dados válidos são enviados via PUT /admin/shop por um admin autenticado, THE Servidor_API SHALL atualizar o estabelecimento e retornar status 200
3. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL rejeitar requisições PUT /admin/shop com status 403

---

### Requisito 6: Horários de Funcionamento do Estabelecimento

**User Story:** Como admin, quero configurar os horários de funcionamento do meu estabelecimento, para que o sistema calcule a disponibilidade corretamente.

#### Critérios de Aceitação

1. WHEN uma requisição GET /admin/shop/hours é feita por um admin autenticado, THE Servidor_API SHALL retornar a lista de horários de funcionamento para cada dia da semana (day, start, end)
2. WHEN horários válidos são enviados via PUT /admin/shop/hours por um admin autenticado, THE Servidor_API SHALL atualizar os horários e retornar status 200
3. THE Servidor_API SHALL aceitar valores null para start e end, indicando que o estabelecimento está fechado naquele dia
4. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL rejeitar requisições aos endpoints de horários com status 403

---

### Requisito 7: Listagem de Serviços (Cliente)

**User Story:** Como cliente, quero ver os serviços disponíveis, para que eu possa escolher o que desejo agendar.

#### Critérios de Aceitação

1. WHEN uma requisição GET /services é recebida, THE Servidor_API SHALL retornar a lista de todos os serviços ativos com os campos id, name, duration, price, description, icon e image
2. THE Servidor_API SHALL retornar apenas serviços do tipo "service" (excluindo adicionais) no endpoint GET /services

---

### Requisito 8: Listagem de Adicionais (Cliente)

**User Story:** Como cliente, quero ver os serviços adicionais disponíveis, para que eu possa complementar meu agendamento.

#### Critérios de Aceitação

1. WHEN uma requisição GET /addons é recebida, THE Servidor_API SHALL retornar a lista de todos os adicionais ativos com os campos id, name, duration, price e image
2. THE Servidor_API SHALL retornar apenas serviços do tipo "addon" no endpoint GET /addons

---

### Requisito 9: Listagem de Profissionais (Cliente)

**User Story:** Como cliente, quero ver os profissionais disponíveis, para que eu possa escolher com quem agendar.

#### Critérios de Aceitação

1. WHEN uma requisição GET /professionals é recebida, THE Servidor_API SHALL retornar a lista de todos os profissionais ativos com os campos id, name, avatar e specialties

---

### Requisito 10: Consulta de Disponibilidade de Horários

**User Story:** Como cliente, quero consultar os horários disponíveis de um profissional em uma data, para que eu possa escolher o melhor horário.

#### Critérios de Aceitação

1. WHEN uma requisição GET /availability/slots com professionalId e date é recebida, THE Servidor_API SHALL retornar a lista de slots com os campos time e available para o profissional na data especificada
2. WHEN o parâmetro professionalId é null ou ausente, THE Servidor_API SHALL retornar a união de disponibilidade de todos os profissionais (um slot é available se pelo menos um profissional estiver disponível)
3. THE Servidor_API SHALL calcular a disponibilidade considerando os horários de trabalho do profissional, horários de almoço e agendamentos existentes
4. THE Servidor_API SHALL calcular a disponibilidade considerando os horários de funcionamento do estabelecimento

---

### Requisito 11: Consulta de Datas Indisponíveis

**User Story:** Como cliente, quero saber quais datas estão totalmente indisponíveis, para que eu não tente agendar em dias sem horários.

#### Critérios de Aceitação

1. WHEN uma requisição GET /availability/disabled-dates com professionalId é recebida, THE Servidor_API SHALL retornar a lista de datas (formato YYYY-MM-DD) totalmente indisponíveis para o profissional
2. WHEN o parâmetro professionalId é null ou ausente, THE Servidor_API SHALL retornar apenas datas em que TODOS os profissionais estão indisponíveis
3. THE Servidor_API SHALL considerar dias de folga, feriados e dias sem horário de funcionamento ao calcular datas indisponíveis

---

### Requisito 12: Criação de Agendamento (Cliente)

**User Story:** Como cliente, quero criar um agendamento, para que eu possa reservar um horário com um profissional.

#### Critérios de Aceitação

1. WHEN dados válidos (clientId, serviceId, professionalId, date, time) são enviados via POST /appointments, THE Servidor_API SHALL criar o agendamento com status "confirmed" e retornar o objeto completo com id, nomes resolvidos (serviceName, professionalName), duration e price
2. WHEN o campo professionalId é null, THE Servidor_API SHALL atribuir automaticamente um profissional disponível no horário solicitado
3. IF o horário solicitado não estiver disponível, THEN THE Servidor_API SHALL retornar status 409 com mensagem indicando conflito de horário
4. IF o serviceId não existir, THEN THE Servidor_API SHALL retornar status 404 com mensagem de erro

---

### Requisito 13: Listagem de Agendamentos do Cliente

**User Story:** Como cliente, quero ver meus agendamentos, para que eu possa acompanhar minhas reservas.

#### Critérios de Aceitação

1. WHEN uma requisição GET /appointments com clientId é recebida, THE Servidor_API SHALL retornar a lista de todos os agendamentos do cliente com os campos id, clientId, serviceId, serviceName, professionalId, professionalName, date, time, duration, price, status e cancelReason
2. IF o parâmetro clientId estiver ausente, THEN THE Servidor_API SHALL retornar status 400

---

### Requisito 14: Cancelamento de Agendamento (Cliente)

**User Story:** Como cliente, quero cancelar um agendamento, para que eu possa liberar o horário quando não puder comparecer.

#### Critérios de Aceitação

1. WHEN uma requisição PATCH /appointments/{id}/cancel com reason é recebida, THE Servidor_API SHALL atualizar o status do agendamento para "cancelled", registrar o motivo e retornar status 204
2. IF o agendamento não existir, THEN THE Servidor_API SHALL retornar status 404
3. IF o agendamento já estiver cancelado, THEN THE Servidor_API SHALL retornar status 400 com mensagem indicando que o agendamento já foi cancelado

---

### Requisito 15: Gestão de Agendamentos (Admin)

**User Story:** Como admin, quero gerenciar todos os agendamentos do estabelecimento, para que eu possa ter controle total da agenda.

#### Critérios de Aceitação

1. WHEN uma requisição GET /admin/appointments é feita por um admin autenticado, THE Servidor_API SHALL retornar todos os agendamentos, suportando filtros opcionais por date, staffId, status, serviceId e clientId
2. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL retornar apenas os agendamentos atribuídos ao próprio profissional no endpoint GET /admin/appointments
3. WHEN uma requisição GET /admin/appointments/{id} é feita, THE Servidor_API SHALL retornar o agendamento específico com todos os campos
4. WHEN dados válidos são enviados via POST /admin/appointments, THE Servidor_API SHALL criar o agendamento e retornar status 201 com o objeto criado
5. WHEN dados válidos são enviados via PUT /admin/appointments/{id}, THE Servidor_API SHALL atualizar o agendamento (reagendar, alterar status) e retornar status 200 com o objeto atualizado
6. WHEN uma requisição DELETE /admin/appointments/{id} é feita por um admin, THE Servidor_API SHALL remover o agendamento e retornar status 204
7. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL rejeitar requisições DELETE /admin/appointments/{id} com status 403

---

### Requisito 16: Gestão de Clientes (Admin)

**User Story:** Como admin, quero gerenciar os clientes do meu estabelecimento, para que eu possa manter um cadastro organizado.

#### Critérios de Aceitação

1. WHEN uma requisição GET /admin/clients é feita por um admin autenticado, THE Servidor_API SHALL retornar a lista paginada de clientes com os campos id, name, phone, email, notes, birthday, totalSpent, lastVisit e createdAt, suportando os parâmetros search, page e perPage
2. WHEN o parâmetro search é fornecido, THE Servidor_API SHALL filtrar clientes cujo name ou phone contenham o termo de busca
3. THE Servidor_API SHALL retornar o campo "total" junto com "data" para suportar paginação no frontend
4. WHEN uma requisição GET /admin/clients/{id} é feita, THE Servidor_API SHALL retornar o cliente específico com todos os campos
5. WHEN dados válidos são enviados via POST /admin/clients, THE Servidor_API SHALL criar o cliente e retornar status 201 com o objeto criado
6. WHEN dados válidos são enviados via PUT /admin/clients/{id}, THE Servidor_API SHALL atualizar o cliente e retornar status 200 com o objeto atualizado
7. WHEN uma requisição DELETE /admin/clients/{id} é feita, THE Servidor_API SHALL remover o cliente e retornar status 204
8. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL rejeitar requisições aos endpoints de clientes com status 403

---

### Requisito 17: Gestão de Serviços e Adicionais (Admin)

**User Story:** Como admin, quero gerenciar os serviços e adicionais do meu estabelecimento, para que eu possa manter o catálogo atualizado.

#### Critérios de Aceitação

1. WHEN uma requisição GET /admin/services é feita por um usuário autenticado, THE Servidor_API SHALL retornar a lista de todos os serviços e adicionais com os campos id, name, duration, price, description, type e image
2. WHEN uma requisição GET /admin/services/{id} é feita, THE Servidor_API SHALL retornar o serviço específico com todos os campos
3. WHEN dados válidos são enviados via POST /admin/services por um admin, THE Servidor_API SHALL criar o serviço ou adicional (conforme campo type) e retornar status 201 com o objeto criado
4. WHEN dados válidos são enviados via PUT /admin/services/{id} por um admin, THE Servidor_API SHALL atualizar o serviço e retornar status 200 com o objeto atualizado
5. WHEN uma requisição DELETE /admin/services/{id} é feita por um admin, THE Servidor_API SHALL remover o serviço e retornar status 204
6. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL permitir apenas leitura (GET) nos endpoints de serviços e rejeitar POST, PUT e DELETE com status 403

---

### Requisito 18: Gestão de Profissionais/Staff (Admin)

**User Story:** Como admin, quero gerenciar os profissionais do meu estabelecimento, para que eu possa controlar a equipe e suas agendas.

#### Critérios de Aceitação

1. WHEN uma requisição GET /admin/staff é feita por um usuário autenticado, THE Servidor_API SHALL retornar a lista de profissionais com os campos id, unitId, name, avatar, specialties, workingHours, phone e email, suportando filtro opcional por unitId
2. WHEN uma requisição GET /admin/staff/{id} é feita, THE Servidor_API SHALL retornar o profissional específico com todos os campos incluindo workingHours (day, start, end, lunchStart, lunchEnd)
3. WHEN dados válidos são enviados via POST /admin/staff por um admin, THE Servidor_API SHALL criar o profissional e retornar status 201 com o objeto criado
4. WHEN dados válidos são enviados via PUT /admin/staff/{id} por um admin, THE Servidor_API SHALL atualizar o profissional e retornar status 200 com o objeto atualizado
5. WHEN uma requisição DELETE /admin/staff/{id} é feita por um admin, THE Servidor_API SHALL remover o profissional e retornar status 204
6. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL permitir apenas leitura (GET) nos endpoints de profissionais e rejeitar POST, PUT e DELETE com status 403

---

### Requisito 19: Gestão de Unidades (Admin)

**User Story:** Como admin, quero gerenciar as unidades/filiais do meu estabelecimento, para que eu possa organizar múltiplas localizações.

#### Critérios de Aceitação

1. WHEN uma requisição GET /admin/units é feita por um usuário autenticado, THE Servidor_API SHALL retornar a lista de unidades com os campos id, name, address e phone
2. WHEN uma requisição GET /admin/units/{id} é feita, THE Servidor_API SHALL retornar a unidade específica com todos os campos
3. WHEN dados válidos são enviados via POST /admin/units por um admin, THE Servidor_API SHALL criar a unidade e retornar status 201 com o objeto criado
4. WHEN dados válidos são enviados via PUT /admin/units/{id} por um admin, THE Servidor_API SHALL atualizar a unidade e retornar status 200 com o objeto atualizado
5. WHEN uma requisição DELETE /admin/units/{id} é feita por um admin, THE Servidor_API SHALL remover a unidade e retornar status 204
6. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL permitir apenas leitura (GET) nos endpoints de unidades e rejeitar POST, PUT e DELETE com status 403

---

### Requisito 20: Dashboard de Métricas (Admin)

**User Story:** Como admin, quero visualizar métricas do meu estabelecimento, para que eu possa acompanhar o desempenho do negócio.

#### Critérios de Aceitação

1. WHEN uma requisição GET /admin/dashboard/stats com parâmetro date é feita por um admin autenticado, THE Servidor_API SHALL retornar as métricas do dia: revenue (faturamento), appointmentCount (total de agendamentos), topService (serviço mais agendado) e newClients (novos clientes)
2. WHEN uma requisição GET /admin/dashboard/weekly-revenue é feita por um admin autenticado, THE Servidor_API SHALL retornar o faturamento semanal agrupado por dia e por profissional
3. WHILE o usuário autenticado possui role "staff", THE Servidor_API SHALL rejeitar requisições aos endpoints de dashboard com status 403

---

### Requisito 21: Middleware de Autenticação e Autorização (Admin)

**User Story:** Como sistema, quero proteger os endpoints administrativos, para que apenas usuários autenticados e autorizados possam acessá-los.

#### Critérios de Aceitação

1. THE Servidor_API SHALL validar o token JWT no header Authorization (formato "Bearer {token}") em todas as requisições aos endpoints /admin/* (exceto /admin/auth/*)
2. IF o token JWT estiver ausente ou inválido, THEN THE Servidor_API SHALL retornar status 401
3. IF o token JWT estiver expirado, THEN THE Servidor_API SHALL retornar status 401 com mensagem indicando expiração
4. THE Servidor_API SHALL extrair o shopId e o role do token JWT e disponibilizá-los para os handlers de rota

---

### Requisito 22: Tratamento de Erros e Validação

**User Story:** Como consumidor da API, quero receber respostas de erro consistentes e informativas, para que eu possa tratar falhas adequadamente.

#### Critérios de Aceitação

1. THE Servidor_API SHALL retornar respostas de erro no formato JSON com os campos "error" (código) e "message" (descrição legível)
2. WHEN uma requisição contém dados inválidos ou campos obrigatórios ausentes, THE Servidor_API SHALL retornar status 400 com detalhes dos campos inválidos
3. WHEN um recurso solicitado não existe, THE Servidor_API SHALL retornar status 404 com mensagem indicando o recurso não encontrado
4. IF ocorrer um erro interno não tratado, THEN THE Servidor_API SHALL retornar status 500 com mensagem genérica e registrar o erro detalhado em log

---

### Requisito 23: Isolamento Multi-Tenant por Estabelecimento

**User Story:** Como plataforma, quero garantir que cada estabelecimento acesse apenas seus próprios dados, para que a privacidade e segurança sejam mantidas.

#### Critérios de Aceitação

1. THE Servidor_API SHALL filtrar todos os dados retornados nos endpoints /admin/* pelo shopId extraído do token JWT do usuário autenticado
2. THE Servidor_API SHALL associar todos os registros criados via endpoints /admin/* ao shopId do usuário autenticado
3. IF um usuário tentar acessar um recurso de outro estabelecimento, THEN THE Servidor_API SHALL retornar status 404 (sem revelar a existência do recurso)
