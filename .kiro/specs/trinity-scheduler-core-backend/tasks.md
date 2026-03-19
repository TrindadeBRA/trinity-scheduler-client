# Plano de Implementação: Trinity Scheduler Core Backend

## Visão Geral

Implementação incremental do backend Express.js + Prisma + PostgreSQL, partindo da infraestrutura base até os endpoints completos com documentação Swagger. Cada tarefa constrói sobre a anterior, garantindo que não haja código órfão.

## Tarefas

- [ ] 1. Configurar infraestrutura do projeto e dependências
  - [ ] 1.1 Inicializar projeto TypeScript com Express.js e dependências
    - Configurar `package.json` com scripts (dev, build, start, test, prisma:generate, prisma:migrate)
    - Instalar dependências: express, prisma, @prisma/client, jsonwebtoken, bcrypt, cors, swagger-jsdoc, swagger-ui-express, dotenv
    - Instalar devDependencies: typescript, ts-node, tsx, @types/express, @types/jsonwebtoken, @types/bcrypt, @types/cors, @types/swagger-jsdoc, @types/swagger-ui-express, vitest, fast-check
    - Criar `tsconfig.json` com target ES2020, module NodeNext, outDir dist, rootDir src, strict true
    - Criar `.env` com DATABASE_URL, JWT_SECRET, PORT
    - _Requisitos: 22.4, 24.1_

  - [ ] 1.2 Criar schema Prisma e gerar client
    - Criar `prisma/schema.prisma` com todos os modelos: Shop, User, Role, ShopHour, Service, ServiceType, Professional, WorkingHour, Client, Appointment, AppointmentStatus, Unit
    - Incluir todos os enums (Role, ServiceType, AppointmentStatus)
    - Incluir todas as relações, @@unique constraints e @default values conforme design
    - Valores financeiros (price, totalSpent) como Int (centavos)
    - Executar `npx prisma generate` e `npx prisma migrate dev`
    - _Requisitos: 23.1, 23.2_

  - [ ] 1.3 Criar utilitários base (prisma client, jwt, password, errors)
    - `src/utils/prisma.ts` — singleton do PrismaClient
    - `src/utils/jwt.ts` — funções sign(payload) e verify(token) com tipagem AuthUser
    - `src/utils/password.ts` — funções hash(password) e compare(password, hash) com bcrypt
    - `src/utils/errors.ts` — classe AppError(statusCode, code, message)
    - `src/types/express.d.ts` — extensão do Request com user (AuthUser) e shopId
    - _Requisitos: 2.3, 2.4, 22.1_

- [ ] 2. Configurar Express app, middlewares globais e Swagger
  - [ ] 2.1 Criar entry point e configuração do Express
    - `src/index.ts` — cria app e escuta na porta (process.env.PORT)
    - `src/app.ts` — configura Express com json(), cors(), monta rotas e error handler
    - `src/config/env.ts` — variáveis de ambiente tipadas (DATABASE_URL, JWT_SECRET, PORT)
    - _Requisitos: 22.4_

  - [ ] 2.2 Implementar middleware de tratamento de erros
    - `src/middlewares/errorHandler.ts` — captura AppError e erros genéricos, mapeia erros Prisma (P2002→409, P2025→404), retorna JSON { error, message }
    - Erros não tratados retornam 500 com mensagem genérica e log via console.error
    - _Requisitos: 22.1, 22.2, 22.3, 22.4_

  - [ ]* 2.3 Escrever teste de propriedade para formato de erros
    - **Propriedade 23: Formato consistente de respostas de erro**
    - **Valida: Requisitos 22.1, 22.2, 22.3**

  - [ ] 2.4 Configurar Swagger/OpenAPI
    - `src/config/swagger.ts` — configuração swagger-jsdoc com info, servers, tags e securitySchemes (bearerAuth, X-Shop-Id)
    - Montar swagger-ui-express em `/api-docs` no app.ts
    - Definir schemas reutilizáveis: Error, Client, ClientInput, Service, ServiceInput, Professional, ProfessionalInput, Appointment, AppointmentInput, Unit, UnitInput, Shop, ShopHour, Slot, DashboardStats, LoginRequest, AdminLoginRequest, AdminLoginResponse, RegisterRequest
    - Definir responses reutilizáveis: Unauthorized, Forbidden, NotFound
    - _Requisitos: 24.1, 24.2, 24.3, 24.4, 24.5_

- [ ] 3. Implementar middlewares de autenticação e autorização
  - [ ] 3.1 Implementar middleware de autenticação JWT (admin)
    - `src/middlewares/auth.ts` — verifica Bearer token, decodifica JWT, injeta req.user com { id, shopId, role, professionalId? }
    - Retorna 401 se token ausente, inválido ou expirado
    - _Requisitos: 21.1, 21.2, 21.3, 21.4_

  - [ ] 3.2 Implementar middleware de autorização por role
    - `src/middlewares/authorize.ts` — factory authorize(...roles) que verifica req.user.role contra lista permitida
    - Retorna 403 se role não autorizado
    - _Requisitos: 21.5_

  - [ ] 3.3 Implementar middleware de filtro multi-tenant
    - `src/middlewares/tenantFilter.ts` — injeta shopId do JWT nas queries (GET: req.query, POST/PUT: req.body)
    - Role admin bypassa o filtro (acesso cross-tenant)
    - _Requisitos: 23.1, 23.2, 23.3_

  - [ ] 3.4 Implementar middleware shopResolver (rotas do cliente)
    - `src/middlewares/shopResolver.ts` — extrai shopId do header X-Shop-Id ou query param shopId
    - Valida existência do shop no banco, injeta req.shopId
    - Retorna 400 se ausente, 404 se shop não existe
    - _Requisitos: 1.6, 1.9_

  - [ ]* 3.5 Escrever teste de propriedade para JWT obrigatório em endpoints admin
    - **Propriedade 24: JWT obrigatório em endpoints admin protegidos**
    - **Valida: Requisitos 21.1, 21.4, 21.5**

  - [ ]* 3.6 Escrever teste de propriedade para isolamento multi-tenant
    - **Propriedade 21: Isolamento multi-tenant por shopId**
    - **Valida: Requisitos 23.1, 23.2, 23.3**

  - [ ]* 3.7 Escrever teste de propriedade para admin bypass de tenant
    - **Propriedade 22: Admin bypassa filtro de tenant**
    - **Valida: Requisitos 21.6**

- [ ] 4. Checkpoint — Verificar infraestrutura base
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [ ] 5. Implementar autenticação do cliente (telefone)
  - [ ] 5.1 Criar rotas de autenticação do cliente
    - `src/routes/client/auth.routes.ts` — POST /auth/login (login por telefone, cria ou retorna clientId) e GET /auth/validate (valida clientId)
    - POST /auth/login: recebe { phone }, busca ou cria Client no shopId, retorna { clientId }
    - GET /auth/validate?clientId={uuid}: valida existência, retorna { clientId, name } ou 404
    - Retorna 400 se phone ausente/vazio ou clientId ausente
    - Incluir anotações Swagger (@swagger) em cada endpoint
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.9_

  - [ ]* 5.2 Escrever teste de propriedade para login por telefone
    - **Propriedade 1: Login por telefone retorna clientId válido**
    - **Valida: Requisitos 1.1, 1.2**

  - [ ]* 5.3 Escrever teste de propriedade para round-trip de validação
    - **Propriedade 2: Round-trip de validação do cliente**
    - **Valida: Requisitos 1.4**

- [ ] 6. Implementar autenticação admin (login, registro, forgot-password)
  - [ ] 6.1 Criar rotas de autenticação admin
    - `src/routes/admin/auth.routes.ts` — POST /admin/auth/login, POST /admin/auth/register, POST /admin/auth/forgot-password
    - Login: valida email/senha com bcrypt, retorna { user: { name, email, avatar, role }, token: JWT }
    - Register: cria User (leader) + Shop + Professional em transação Prisma ($transaction), retorna 201
    - Forgot-password: gera resetToken com validade de 1h, retorna 200 (mesmo para email inexistente)
    - Incluir anotações Swagger em cada endpoint
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3_

  - [ ]* 6.2 Escrever teste de propriedade para round-trip de autenticação admin
    - **Propriedade 3: Round-trip de autenticação admin (login → JWT → dados)**
    - **Valida: Requisitos 2.1, 2.3**

  - [ ]* 6.3 Escrever teste de propriedade para senhas bcrypt
    - **Propriedade 4: Senhas armazenadas como hash bcrypt**
    - **Valida: Requisitos 2.4**

  - [ ]* 6.4 Escrever teste de propriedade para atomicidade do registro
    - **Propriedade 5: Atomicidade do registro (leader + shop + professional)**
    - **Valida: Requisitos 3.1, 3.4**

  - [ ]* 6.5 Escrever teste de propriedade para token de redefinição
    - **Propriedade 6: Token de redefinição com validade máxima de 1 hora**
    - **Valida: Requisitos 4.1, 4.3**

- [ ] 7. Implementar rotas do estabelecimento (shop e horários)
  - [ ] 7.1 Criar rotas de gestão do shop
    - `src/routes/admin/shop.routes.ts` — GET /admin/shop e PUT /admin/shop
    - GET retorna dados do shop do usuário autenticado (name, phone, email, address)
    - PUT atualiza dados do shop, authorize('leader', 'admin')
    - GET /admin/shop/hours e PUT /admin/shop/hours — CRUD de horários de funcionamento (7 dias, start/end nullable)
    - Incluir anotações Swagger em cada endpoint
    - _Requisitos: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 7.2 Escrever teste de propriedade para round-trip de dados do shop
    - **Propriedade 7: Round-trip de dados do estabelecimento**
    - **Valida: Requisitos 5.1, 5.2**

  - [ ]* 7.3 Escrever teste de propriedade para round-trip de horários
    - **Propriedade 8: Round-trip de horários de funcionamento**
    - **Valida: Requisitos 6.1, 6.2**

- [ ] 8. Checkpoint — Verificar autenticação e shop
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [ ] 9. Implementar rotas públicas do cliente (serviços, adicionais, profissionais)
  - [ ] 9.1 Criar rotas de listagem de serviços e adicionais
    - `src/routes/client/services.routes.ts` — GET /services (retorna serviços ativos com type="service")
    - `src/routes/client/addons.routes.ts` — GET /addons (retorna adicionais ativos com type="addon")
    - Campos retornados: id, name, duration, price, description, icon, image
    - Incluir anotações Swagger
    - _Requisitos: 7.1, 7.2, 8.1, 8.2_

  - [ ] 9.2 Criar rota de listagem de profissionais
    - `src/routes/client/professionals.routes.ts` — GET /professionals (retorna profissionais ativos)
    - Campos retornados: id, name, avatar, specialties
    - Incluir anotações Swagger
    - _Requisitos: 9.1_

  - [ ]* 9.3 Escrever teste de propriedade para filtragem de tipo
    - **Propriedade 9: Filtragem de tipo em serviços e adicionais**
    - **Valida: Requisitos 7.1, 7.2, 8.1, 8.2**

- [ ] 10. Implementar serviço e rotas de disponibilidade
  - [ ] 10.1 Implementar AvailabilityService
    - `src/services/availability.service.ts` — funções getAvailableSlots e getDisabledDates
    - getAvailableSlots: busca ShopHour + WorkingHour + Appointments, calcula effectiveStart/End, gera slots de 30min, remove almoço e conflitos
    - getDisabledDates: para cada data no range, verifica se há pelo menos 1 slot disponível
    - Quando professionalId é null, unir disponibilidade de todos os profissionais (slot available se ≥1 profissional disponível)
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3_

  - [ ] 10.2 Criar rotas de disponibilidade
    - `src/routes/client/availability.routes.ts` — GET /availability/slots e GET /availability/disabled-dates
    - GET /availability/slots: params professionalId (opcional), date (obrigatório), serviceDuration (opcional)
    - GET /availability/disabled-dates: params professionalId (opcional), startDate, endDate
    - Incluir anotações Swagger
    - _Requisitos: 10.1, 10.2, 11.1, 11.2_

  - [ ]* 10.3 Escrever teste de propriedade para slots respeitam restrições
    - **Propriedade 10: Slots de disponibilidade respeitam restrições**
    - **Valida: Requisitos 10.1, 10.3, 10.4**

  - [ ]* 10.4 Escrever teste de propriedade para união de disponibilidade
    - **Propriedade 11: União de disponibilidade (sem professionalId)**
    - **Valida: Requisitos 10.2**

  - [ ]* 10.5 Escrever teste de propriedade para consistência datas/slots
    - **Propriedade 12: Datas indisponíveis são consistentes com slots**
    - **Valida: Requisitos 11.1, 11.2, 11.3**

- [ ] 11. Implementar agendamentos do cliente
  - [ ] 11.1 Implementar AppointmentService
    - `src/services/appointment.service.ts` — funções createAppointment e cancelAppointment
    - createAppointment: valida slot disponível, calcula duration (serviço + addons), calcula price (serviço + addons em centavos), auto-atribui profissional se null, cria com status "confirmed"
    - cancelAppointment: valida existência e status, atualiza para "cancelled" com reason
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 14.1_

  - [ ] 11.2 Criar rotas de agendamentos do cliente
    - `src/routes/client/appointments.routes.ts` — POST /appointments, GET /appointments, PATCH /appointments/:id/cancel
    - POST: cria agendamento, retorna objeto com nomes resolvidos (serviceName, professionalName)
    - GET: lista agendamentos por clientId (query param), retorna com nomes resolvidos
    - PATCH /:id/cancel: cancela com reason, retorna 204
    - Incluir anotações Swagger
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 13.1, 13.2, 14.1, 14.2, 14.3_

  - [ ]* 11.3 Escrever teste de propriedade para criação com detecção de conflito
    - **Propriedade 13: Criação de agendamento com detecção de conflito**
    - **Valida: Requisitos 12.1, 12.3**

  - [ ]* 11.4 Escrever teste de propriedade para auto-atribuição de profissional
    - **Propriedade 14: Auto-atribuição de profissional**
    - **Valida: Requisitos 12.2**

  - [ ]* 11.5 Escrever teste de propriedade para round-trip de cancelamento
    - **Propriedade 15: Round-trip de cancelamento**
    - **Valida: Requisitos 14.1**

- [ ] 12. Checkpoint — Verificar fluxo completo do cliente
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [ ] 13. Implementar rotas admin de agendamentos
  - [ ] 13.1 Criar rotas de gestão de agendamentos (admin)
    - `src/routes/admin/appointments.routes.ts` — GET /admin/appointments (com filtros date, professionalId, status, serviceId, clientId), GET /admin/appointments/:id, POST /admin/appointments, PUT /admin/appointments/:id, DELETE /admin/appointments/:id
    - Professional vê apenas próprios agendamentos (filtro por professionalId do JWT)
    - authorize: GET para leader/professional/admin, POST/PUT/DELETE para leader/admin
    - Incluir anotações Swagger
    - _Requisitos: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [ ]* 13.2 Escrever teste de propriedade para isolamento por role professional
    - **Propriedade 16: Isolamento de agendamentos por role professional**
    - **Valida: Requisitos 15.2**

- [ ] 14. Implementar rotas admin de clientes
  - [ ] 14.1 Criar rotas de gestão de clientes (admin)
    - `src/routes/admin/clients.routes.ts` — GET /admin/clients (paginado com search, page, perPage), GET /admin/clients/:id, POST /admin/clients, PUT /admin/clients/:id, DELETE /admin/clients/:id
    - GET retorna { data: Client[], total: number }
    - search filtra por name ou phone (contains, insensitive)
    - authorize: leader/admin apenas
    - Incluir anotações Swagger
    - _Requisitos: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

  - [ ]* 14.2 Escrever teste de propriedade para busca de clientes
    - **Propriedade 17: Busca de clientes filtra por nome ou telefone**
    - **Valida: Requisitos 16.2, 16.3**

- [ ] 15. Implementar rotas admin de serviços
  - [ ] 15.1 Criar rotas de gestão de serviços (admin)
    - `src/routes/admin/services.routes.ts` — GET /admin/services, GET /admin/services/:id, POST /admin/services, PUT /admin/services/:id, DELETE /admin/services/:id
    - GET retorna todos os serviços e adicionais (ambos os types)
    - authorize: GET para leader/professional/admin, POST/PUT/DELETE para leader/admin
    - Incluir anotações Swagger
    - _Requisitos: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 16. Implementar rotas admin de profissionais
  - [ ] 16.1 Criar rotas de gestão de profissionais (admin)
    - `src/routes/admin/professionals.routes.ts` — GET /admin/professionals (filtro por unitId), GET /admin/professionals/:id (inclui workingHours), POST /admin/professionals, PUT /admin/professionals/:id, DELETE /admin/professionals/:id
    - PUT por professional: permitido apenas no próprio registro (req.user.professionalId === id), senão 403
    - authorize: GET para leader/professional/admin, POST/DELETE para leader/admin, PUT com lógica especial para professional
    - Incluir anotações Swagger
    - _Requisitos: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

- [ ] 17. Implementar rotas admin de unidades
  - [ ] 17.1 Criar rotas de gestão de unidades (admin)
    - `src/routes/admin/units.routes.ts` — GET /admin/units, GET /admin/units/:id, POST /admin/units, PUT /admin/units/:id, DELETE /admin/units/:id
    - authorize: GET para leader/professional/admin, POST/PUT/DELETE para leader/admin
    - Incluir anotações Swagger
    - _Requisitos: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

  - [ ]* 17.2 Escrever teste de propriedade para CRUD round-trip de recursos admin
    - **Propriedade 18: CRUD round-trip de recursos admin**
    - **Valida: Requisitos 16.4-16.7, 17.2-17.5, 18.2-18.5, 19.2-19.5**

  - [ ]* 17.3 Escrever teste de propriedade para autorização por role professional
    - **Propriedade 19: Autorização por role — professional tem acesso somente leitura**
    - **Valida: Requisitos 5.3, 6.4, 15.7, 16.8, 17.6, 18.6, 18.7, 19.6, 20.3**

- [ ] 18. Checkpoint — Verificar CRUD admin completo
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [ ] 19. Implementar dashboard de métricas
  - [ ] 19.1 Criar rotas de dashboard (admin)
    - `src/routes/admin/dashboard.routes.ts` — GET /admin/dashboard/stats (param date) e GET /admin/dashboard/weekly-revenue
    - Stats: calcula revenue (soma price de confirmed/completed em centavos), appointmentCount, topService (serviço com mais agendamentos), newClients (clientes criados na data)
    - Weekly-revenue: faturamento dos últimos 7 dias agrupado por dia e profissional
    - authorize: leader/admin apenas
    - Incluir anotações Swagger
    - _Requisitos: 20.1, 20.2, 20.3_

  - [ ]* 19.2 Escrever teste de propriedade para cálculo de métricas
    - **Propriedade 20: Cálculo correto de métricas do dashboard**
    - **Valida: Requisitos 20.1**

- [ ] 20. Montar roteador principal e integrar todos os componentes
  - [ ] 20.1 Criar roteador principal e conectar todas as rotas
    - `src/routes/index.ts` — mountRoutes(app) conectando todas as rotas client (com shopResolver) e admin (com authMiddleware + tenantFilter)
    - Verificar que todas as rotas estão montadas nos paths corretos conforme design
    - Garantir que middleware chain está na ordem correta: CORS → JSON → Swagger → Routes → Error Handler
    - _Requisitos: 1.9, 21.1, 23.1_

  - [ ]* 20.2 Escrever teste de propriedade para documentação Swagger
    - **Propriedade 25: Documentação Swagger cobre todos os endpoints**
    - **Valida: Requisito 24**

- [ ] 21. Checkpoint final — Verificar integração completa
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude
- Valores financeiros sempre em centavos (Int) — nunca float
- Todas as rotas devem incluir anotações Swagger (@swagger) no JSDoc
