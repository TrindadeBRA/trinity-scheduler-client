# Plano de Implementação: Client Scheduling App

## Visão Geral

Implementação incremental da aplicação de agendamento voltada ao cliente final, usando React 18, TypeScript, React Router, React Hook Form + Zod, TanStack React Query, Zustand, Tailwind CSS e Vite. Cada tarefa constrói sobre a anterior, garantindo que não haja código órfão. Todos os hooks usam dados mock com console.log (sem backend real).

## Tarefas

- [x] 1. Scaffold do projeto e configuração base
  - [x] 1.1 Inicializar projeto Vite com React + TypeScript e instalar dependências
    - Criar projeto com `npm create vite@latest` (template react-ts)
    - Instalar: `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand`, `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`
    - Instalar dev: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `fast-check`
    - Configurar `tailwind.config.ts`, `postcss.config.js`, `vite.config.ts`, `vitest.config.ts`
    - _Requisitos: 8.2, 8.3, 9.4_

  - [x] 1.2 Criar estrutura de pastas e arquivos de configuração de nicho
    - Criar estrutura: `src/components/ui`, `src/components/booking`, `src/components/layout`, `src/hooks`, `src/services`, `src/mocks`, `src/stores`, `src/pages`, `src/config`, `src/schemas`, `src/lib`, `src/test/properties`, `src/test/unit`
    - Criar `src/config/texts.json` com todos os textos organizados por página (login, booking, agendamentos, validação, geral)
    - Criar `src/config/niche.json` com configuração do nicho barbearia (businessName, logo, niche, currency, locale)
    - Criar `src/index.css` com CSS custom properties do tema (cores primária, secundária, background, texto, etc.) e integração com Tailwind
    - Criar `src/test/setup.ts` para configuração do Vitest com jsdom e testing-library
    - _Requisitos: 8.1, 8.2, 8.4, 8.5_

  - [x] 1.3 Criar utilitários e tipos base
    - Criar `src/lib/utils.ts` com função `cn()` (class merge) e formatadores (moeda, data, horário)
    - Criar `src/lib/types.ts` com todas as interfaces TypeScript: `Service`, `Professional`, `TimeSlot`, `DayAvailability`, `Appointment`, `CreateAppointmentPayload`, `NicheConfig`, `AppTexts`
    - _Requisitos: 8.3_

- [x] 2. Camada de dados mock e serviços
  - [x] 2.1 Criar dados mock por entidade
    - Criar `src/mocks/services.ts` com lista de serviços de barbearia (mínimo 4 serviços com todos os campos)
    - Criar `src/mocks/professionals.ts` com lista de profissionais (mínimo 3 com nome, avatar, specialties)
    - Criar `src/mocks/availability.ts` com dados de disponibilidade (30 dias, slots de 30min, variando por profissional)
    - Criar `src/mocks/appointments.ts` com agendamentos mock (próximos e anteriores)
    - _Requisitos: 10.2, 10.5_

  - [x] 2.2 Criar camada de serviço com delay simulado
    - Criar `src/services/authService.ts` — login por telefone (gera clientId mock, console.log)
    - Criar `src/services/serviceService.ts` — listar serviços (delay + retorno mock)
    - Criar `src/services/professionalService.ts` — listar profissionais (delay + retorno mock)
    - Criar `src/services/availabilityService.ts` — buscar slots por data/profissional (delay + retorno mock, computar datas desabilitadas)
    - Criar `src/services/appointmentService.ts` — listar, criar e cancelar agendamentos (delay + console.log + retorno mock)
    - Todas as funções devem aceitar delay configurável e registrar operações via console.log
    - _Requisitos: 10.1, 10.3, 10.4_

  - [ ]* 2.3 Escrever testes de propriedade para dados mock e serviços
    - **Propriedade 18: Dados mock possuem estrutura completa**
    - **Propriedade 19: Delay simulado na camada de serviço**
    - **Propriedade 20: Mutações registram dados completos e retornam sucesso**
    - **Valida: Requisitos 10.2, 10.3, 10.4**

- [x] 3. Checkpoint — Verificar dados mock e serviços
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Stores e autenticação
  - [x] 4.1 Criar auth store e lógica de autenticação
    - Criar `src/stores/authStore.ts` com Zustand: `clientId`, `isAuthenticated`, `login(phone)`, `loginFromUrl(clientId)`, `logout()`
    - `login` deve chamar `authService.login`, armazenar clientId em localStorage
    - `loginFromUrl` deve armazenar clientId recebido em localStorage
    - `logout` deve limpar localStorage e resetar estado
    - Inicialização deve verificar localStorage para auto-login
    - _Requisitos: 1.1, 1.2, 1.3, 1.5_

  - [x] 4.2 Criar booking store (Zustand)
    - Criar `src/stores/bookingStore.ts` com estado do wizard: `currentStep`, `selectedService`, `selectedProfessional`, `selectedDate`, `selectedTime`
    - Implementar ações: `setService`, `setProfessional`, `setDateTime`, `goToStep`, `nextStep`, `prevStep`, `reset`
    - `nextStep` incrementa `currentStep`, `prevStep` decrementa sem perder seleções
    - _Requisitos: 2.2, 3.2, 4.3, 5.3_

  - [ ]* 4.3 Escrever testes de propriedade para autenticação
    - **Propriedade 1: Round-trip de autenticação por telefone**
    - **Propriedade 2: Auto-login a partir de localStorage**
    - **Propriedade 3: Deep link URL armazena e autentica**
    - **Propriedade 5: Logout limpa localStorage**
    - **Valida: Requisitos 1.1, 1.2, 1.3, 1.5**

  - [ ]* 4.4 Escrever testes de propriedade para booking store
    - **Propriedade 7: Seleção no wizard avança etapa e registra estado**
    - **Propriedade 13: Navegação para trás preserva seleções**
    - **Valida: Requisitos 2.2, 3.2, 4.3, 5.3**

- [x] 5. Schemas de validação e hooks React Query
  - [x] 5.1 Criar schemas Zod de validação
    - Criar `src/schemas/phoneSchema.ts` com validação de telefone (apenas dígitos, 10-15 caracteres) usando mensagens do `texts.json`
    - _Requisitos: 1.4, 11.1, 11.2_

  - [x] 5.2 Criar hooks React Query
    - Criar `src/hooks/useServices.ts` — query para listar serviços
    - Criar `src/hooks/useProfessionals.ts` — query para listar profissionais
    - Criar `src/hooks/useAvailableSlots.ts` — query para buscar slots por data/profissional, expor `disabledDates`
    - Criar `src/hooks/useAppointments.ts` — query para listar agendamentos do cliente, separar em `upcoming` e `past`
    - Criar `src/hooks/useCreateAppointment.ts` — mutation para criar agendamento
    - Criar `src/hooks/useCancelAppointment.ts` — mutation para cancelar agendamento
    - Todos os hooks devem usar a camada de serviço criada na tarefa 2.2
    - _Requisitos: 10.1, 6.1, 5.2, 7.2_

  - [ ]* 5.3 Escrever testes de propriedade para validação
    - **Propriedade 4: Validação do schema de telefone**
    - **Propriedade 21: Mensagens de erro vêm do arquivo de textos**
    - **Propriedade 22: Botão de submissão desabilitado com formulário inválido**
    - **Valida: Requisitos 1.4, 11.1, 11.2, 11.4**

- [x] 6. Checkpoint — Verificar stores, schemas e hooks
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Componentes UI base
  - [x] 7.1 Criar componentes UI reutilizáveis
    - Criar `src/components/ui/Button.tsx` — botão com variantes (primary, secondary, ghost), estados (loading, disabled)
    - Criar `src/components/ui/Card.tsx` — card genérico com variantes (selectable, default)
    - Criar `src/components/ui/Input.tsx` — input com label, erro e integração React Hook Form
    - Criar `src/components/ui/Skeleton.tsx` — skeleton loading genérico
    - Criar `src/components/ui/SkeletonList.tsx` — lista de skeletons para estados de carregamento
    - Criar `src/components/ui/Dialog.tsx` — diálogo de confirmação (para cancelamento)
    - Todos os componentes devem usar tokens do tema (sem cores hardcoded) e textos do `texts.json`
    - _Requisitos: 8.2, 8.3, 9.1, 9.2, 9.5_

  - [x] 7.2 Criar componentes de layout
    - Criar `src/components/layout/MobileLayout.tsx` — wrapper com header, conteúdo scrollável e navegação inferior
    - Criar `src/components/layout/Header.tsx` — logo e nome do nicho (de `niche.json`) + botão sair
    - Layout mobile-first, responsivo de 320px a 1440px
    - _Requisitos: 8.5, 9.1, 9.2_

- [x] 8. Página de login e fluxo de autenticação
  - [x] 8.1 Implementar LoginPage com formulário de telefone
    - Criar `src/pages/LoginPage.tsx` com formulário React Hook Form + Zod
    - Validação em tempo real (onBlur/onChange), mensagens de erro do `texts.json`
    - Botão desabilitado enquanto formulário inválido
    - Ao submeter com sucesso, redirecionar para `/booking`
    - _Requisitos: 1.1, 1.4, 11.1, 11.2, 11.3, 11.4_

  - [x] 8.2 Implementar roteamento e guards de autenticação
    - Criar `src/App.tsx` com React Router: rotas protegidas (redirect para `/` se não autenticado)
    - Criar `src/main.tsx` com providers (QueryClientProvider, BrowserRouter)
    - Implementar leitura de `clientId` da URL para deep link (Requisito 1.3)
    - Auto-login via localStorage ao carregar app (Requisito 1.2)
    - _Requisitos: 1.2, 1.3, 1.5_

- [x] 9. Wizard de agendamento — Etapas 1 e 2
  - [x] 9.1 Implementar BookingWizard e StepIndicator
    - Criar `src/components/booking/BookingWizard.tsx` — orquestra as 4 etapas, usa booking store
    - Criar `src/components/booking/StepIndicator.tsx` — indicador visual de progresso
    - Animações/transições suaves entre etapas
    - _Requisitos: 9.3_

  - [x] 9.2 Implementar seleção de serviço
    - Criar `src/components/booking/ServiceSelection.tsx` — grid de ServiceCards
    - Criar `src/components/booking/ServiceCard.tsx` — card com nome, duração, preço, ícone (Lucide)
    - Skeleton loading enquanto carrega
    - Ao selecionar, registrar no booking store e avançar etapa
    - _Requisitos: 2.1, 2.2, 2.3, 2.4_

  - [x] 9.3 Implementar seleção de profissional
    - Criar `src/components/booking/ProfessionalSelection.tsx` — lista de ProfessionalCards + opção "Sem preferência"
    - Criar `src/components/booking/ProfessionalCard.tsx` — card com foto e nome
    - Skeleton loading enquanto carrega
    - Ao selecionar, registrar no booking store e avançar etapa
    - _Requisitos: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 9.4 Escrever testes de propriedade para exibição de serviços e profissionais
    - **Propriedade 6: Exibição de serviços contém campos obrigatórios**
    - **Propriedade 8: Exibição de profissionais contém campos obrigatórios**
    - **Valida: Requisitos 2.1, 3.1**

- [x] 10. Wizard de agendamento — Etapas 3 e 4
  - [x] 10.1 Implementar seleção de data e horário
    - Criar `src/components/booking/DateTimeSelection.tsx` — calendário (30 dias) + grade de horários
    - Criar `src/components/booking/TimeSlotGrid.tsx` — grade de slots clicáveis
    - Datas sem horários desabilitadas visualmente
    - Skeleton loading enquanto carrega horários
    - Ao selecionar data + horário, registrar no booking store e avançar
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 10.2 Implementar confirmação e criação do agendamento
    - Criar `src/components/booking/BookingConfirmation.tsx` — resumo com serviço, profissional, data, horário, preço
    - Botão confirmar chama `useCreateAppointment`, exibe loading
    - Em caso de erro, exibir mensagem com opção de tentar novamente
    - Botão voltar para editar seleções anteriores
    - _Requisitos: 5.1, 5.2, 5.3, 5.4_

  - [x] 10.3 Implementar página de sucesso
    - Criar `src/pages/BookingSuccessPage.tsx` — detalhes do agendamento + botão "Agendar novamente"
    - "Agendar novamente" reseta o booking store e redireciona para `/booking`
    - _Requisitos: 5.5_

  - [x] 10.4 Criar BookingPage integrando o wizard
    - Criar `src/pages/BookingPage.tsx` que renderiza `BookingWizard` dentro do `MobileLayout`
    - _Requisitos: 2.2, 3.2, 4.3_

  - [ ]* 10.5 Escrever testes de propriedade para calendário e booking
    - **Propriedade 9: Calendário exibe 30 dias a partir de hoje**
    - **Propriedade 10: Horários filtrados por data e profissional**
    - **Propriedade 11: Datas sem horários são desabilitadas**
    - **Propriedade 12: Resumo do agendamento contém todos os dados**
    - **Valida: Requisitos 4.1, 4.2, 4.4, 5.1, 5.5**

- [x] 11. Checkpoint — Verificar fluxo completo de agendamento
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Agendamentos e cancelamento
  - [x] 12.1 Implementar página de agendamentos
    - Criar `src/pages/AppointmentsPage.tsx` — lista separada em "Próximos" e "Anteriores"
    - Cada item exibe serviço, profissional, data, horário, status
    - Skeleton loading enquanto carrega
    - Agendamentos futuros são clicáveis (navega para detalhe)
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

  - [x] 12.2 Implementar página de detalhe e cancelamento
    - Criar `src/pages/AppointmentDetailPage.tsx` — detalhe do agendamento com opção de cancelar
    - Diálogo de confirmação antes de cancelar
    - Cancelamento via `useCancelAppointment`, exibe loading
    - Em caso de erro, exibir mensagem e manter agendamento inalterado
    - Após cancelar, atualizar lista e voltar
    - _Requisitos: 7.1, 7.2, 7.3_

  - [ ]* 12.3 Escrever testes de propriedade para agendamentos
    - **Propriedade 14: Partição de agendamentos em próximos e anteriores**
    - **Propriedade 15: Opção de cancelamento apenas para agendamentos futuros**
    - **Valida: Requisitos 6.1, 6.3**

- [x] 13. Configuração de nicho e textos
  - [x] 13.1 Integrar textos e configuração de nicho em todos os componentes
    - Garantir que todos os componentes carregam textos de `texts.json` (nenhum texto hardcoded)
    - Garantir que Header usa `niche.json` para nome e logo
    - Verificar que todas as cores usam tokens do tema (CSS variables)
    - _Requisitos: 8.1, 8.2, 8.4, 8.5_

  - [ ]* 13.2 Escrever testes de propriedade para configuração de nicho
    - **Propriedade 16: Textos carregados do arquivo JSON**
    - **Propriedade 17: Configuração de nicho carregada e utilizada**
    - **Valida: Requisitos 8.1, 8.5**

- [x] 14. Checkpoint final — Verificar aplicação completa
  - Ensure all tests pass, ask the user if questions arise.

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude
- Testes unitários validam exemplos específicos e edge cases
- A linguagem de implementação é TypeScript (React)
