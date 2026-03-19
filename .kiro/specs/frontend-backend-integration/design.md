# Design Document — Frontend-Backend Integration

## Overview

Este documento descreve a arquitetura de integração dos dois frontends do Trinity Scheduler com o backend real.

O objetivo é substituir todos os Mock_Services por Real_Services que realizam chamadas HTTP ao backend `trinity-scheduler-core` (Express.js + Prisma + PostgreSQL, `http://localhost:3000`), sem quebrar as assinaturas existentes de hooks e componentes.

Há dois frontends com requisitos de autenticação distintos:

- **trinity-scheduler-client**: frontend do cliente final. Identifica o estabelecimento via header `X-Shop-Id`, lido do query param `?ref=<base64>` da URL.
- **trinity-scheduler-admin**: painel administrativo. Autentica via JWT (`Authorization: Bearer <token>`), com interceptor de 401 que redireciona para login.

Ambos os frontends usam `fetch` nativo (sem axios), TanStack React Query v5 para cache/estado de servidor, e Zustand para estado global.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   trinity-scheduler-client                       │
│                                                                  │
│  Pages / Components                                              │
│       │                                                          │
│  React Query Hooks (useServices, useAppointments, ...)           │
│       │                                                          │
│  Services (authService, serviceService, appointmentService, ...) │
│       │                                                          │
│  src/lib/api.ts  ──── X-Shop-Id (from ?ref= base64) ────────────┤
│  src/lib/price.ts (centsToReais, reaisToCents)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP (fetch)
                            ▼
              ┌─────────────────────────┐
              │  trinity-scheduler-core  │
              │  http://localhost:3000   │
              │  Express + Prisma + PG   │
              └─────────────────────────┘
                            ▲
                            │ HTTP (fetch)
┌───────────────────────────┴─────────────────────────────────────┐
│                   trinity-scheduler-admin                        │
│                                                                  │
│  Pages / Components                                              │
│       │                                                          │
│  React Query Hooks (useAppointments, useClients, useStaff, ...)  │
│       │                                                          │
│  Services (appointmentService, clientService, staffService, ...) │
│       │                                                          │
│  src/lib/api.ts  ──── Authorization: Bearer JWT ────────────────┤
│  src/lib/mappers.ts (staff ↔ professional)                       │
│  src/utils/price.ts (centsToReais, reaisToCents)                 │
│       │                                                          │
│  Zustand Stores (userStore ← JWT, shopStore ← GET /admin/shop)   │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de autenticação — Client Frontend

```
URL: /booking?ref=<base64(shopId)>
        │
        ▼
src/lib/api.ts: decodeShopId() → shopId
        │
        ▼
clientApi(path, options) → fetch(VITE_API_URL + path, {
  headers: { "X-Shop-Id": shopId }
})
```

### Fluxo de autenticação — Admin Frontend

```
Login form → POST /admin/auth/login
        │
        ▼
userStore.login() → { user, token }
        │
        ├── localStorage.setItem("trinity_admin_token", token)
        ├── set({ isAuthenticated: true, user })
        └── shopStore.loadShop() → GET /admin/shop

adminApi(path, options) → fetch(VITE_API_URL + path, {
  headers: { "Authorization": "Bearer " + token }
})
        │
        ▼ (se 401)
        localStorage.removeItem("trinity_admin_token")
        navigate("/login")
```

---

## Components and Interfaces

### Client Frontend — `src/lib/api.ts`

```typescript
// Decodifica o shopId do query param ?ref=<base64>
export function decodeShopId(): string | null

// Wrapper de fetch com X-Shop-Id automático
// Lança ApiError em respostas não-ok
export async function clientApi(path: string, options?: RequestInit): Promise<Response>
```

### Client Frontend — `src/lib/price.ts`

```typescript
export const centsToReais = (cents: number): number => cents / 100
export const reaisToCents = (reais: number): number => Math.round(reais * 100)
```

### Client Frontend — `src/services/authService.ts`

```typescript
// POST /auth/login → { clientId }
export async function login(phone: string): Promise<string>

// GET /auth/validate?clientId=<id>
export async function validateSession(clientId: string): Promise<boolean>
```

### Client Frontend — `src/services/serviceService.ts`

```typescript
// GET /services → Service[] (price convertido para reais)
export async function getServices(): Promise<Service[]>
```

### Client Frontend — `src/services/addonService.ts` (novo)

```typescript
// GET /addons → AddonService[] (price convertido para reais)
export async function getAddons(): Promise<AddonService[]>
```

### Client Frontend — `src/services/professionalService.ts`

```typescript
// GET /professionals → Professional[]
export async function getProfessionals(): Promise<Professional[]>
```

### Client Frontend — `src/services/availabilityService.ts`

```typescript
// GET /availability/slots?date=&professionalId=&serviceDuration=
export async function getAvailableSlots(
  professionalId: string | null,
  date: string,
  serviceDuration?: number
): Promise<TimeSlot[]>

// GET /availability/disabled-dates?startDate=&endDate=&professionalId=
export async function getDisabledDates(
  professionalId: string | null,
  startDate?: string,
  endDate?: string
): Promise<string[]>
```

### Client Frontend — `src/services/appointmentService.ts`

```typescript
// GET /appointments?clientId=<id> → Appointment[] (price em reais)
export async function getAppointments(clientId: string): Promise<Appointment[]>

// POST /appointments → Appointment (price em reais)
export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment>

// PATCH /appointments/<id>/cancel
export async function cancelAppointment(appointmentId: string, reason?: string): Promise<void>
```

### Client Frontend — `src/stores/authStore.ts` (modificado)

```typescript
interface AuthState {
  clientId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (phone: string) => Promise<void>       // chama authService.login()
  loginFromUrl: (clientId: string) => void
  logout: () => void
  init: () => Promise<void>                      // chama authService.validateSession()
}
```

---

### Admin Frontend — `src/lib/api.ts`

```typescript
// Wrapper de fetch com Authorization: Bearer automático
// Intercepta 401 → remove token + redireciona para /login
export async function adminApi(path: string, options?: RequestInit): Promise<Response>
```

### Admin Frontend — `src/utils/price.ts`

```typescript
export const centsToReais = (cents: number): number => cents / 100
export const reaisToCents = (reais: number): number => Math.round(reais * 100)
```

### Admin Frontend — `src/lib/mappers.ts`

```typescript
interface BackendProfessional {
  professionalId: string
  professionalName: string
  [key: string]: unknown
}

// Backend → Admin
export function fromBackendProfessional(p: BackendProfessional): StaffMember

// Admin → Backend
export function toBackendProfessional(s: StaffMember): BackendProfessional
```

### Admin Frontend — `src/services/appointmentService.ts` (modificado)

```typescript
interface AppointmentFilters {
  date?: string
  staffId?: string      // convertido para professionalId na query string
  status?: string
  serviceId?: string
  clientId?: string
}

export const appointmentService = {
  getAll: (filters?: AppointmentFilters) => Promise<Appointment[]>
  getByDate: (date: string) => Promise<Appointment[]>
  getById: (id: string) => Promise<Appointment>
  create: (data: Omit<Appointment, "id">) => Promise<Appointment>
  update: (id: string, data: Partial<Appointment>) => Promise<Appointment>
  delete: (id: string) => Promise<void>
}
// price convertido cents→reais nas respostas
// staffId↔professionalId mapeado via mappers.ts
```

### Admin Frontend — `src/services/clientService.ts` (modificado)

```typescript
export const clientService = {
  getAll: () => Promise<Client[]>
  search: (query: string, page?: number, perPage?: number) => Promise<{ data: Client[]; total: number }>
  getById: (id: string) => Promise<Client>
  create: (data: Omit<Client, "id" | "createdAt" | "totalSpent" | "lastVisit">) => Promise<Client>
  update: (id: string, data: Partial<Client>) => Promise<Client>
  delete: (id: string) => Promise<void>
}
// totalSpent convertido de cents para reais em todas as respostas
```

### Admin Frontend — `src/services/serviceService.ts` (modificado)

```typescript
export const serviceService = {
  getAll: () => Promise<Service[]>
  getById: (id: string) => Promise<Service>
  create: (data: Omit<Service, "id">) => Promise<Service>
  update: (id: string, data: Partial<Service>) => Promise<Service>
  delete: (id: string) => Promise<void>
}
// price: cents→reais nas respostas, reais→cents nos envios (POST/PUT)
```

### Admin Frontend — `src/services/staffService.ts` (modificado)

```typescript
export const staffService = {
  getAll: (filters?: { unitId?: string }) => Promise<StaffMember[]>
  getById: (id: string) => Promise<StaffMember>
  create: (data: Omit<StaffMember, "id">) => Promise<StaffMember>
  update: (id: string, data: Partial<StaffMember>) => Promise<StaffMember>
  delete: (id: string) => Promise<void>
}
// usa fromBackendProfessional/toBackendProfessional internamente
// passa unitId como query param: GET /admin/staff?unitId=<id>
```

### Admin Frontend — `src/services/unitService.ts` (modificado)

```typescript
export const unitService = {
  getAll: () => Promise<Unit[]>
  getById: (id: string) => Promise<Unit>
  create: (data: Omit<Unit, "id">) => Promise<Unit>
  update: (id: string, data: Partial<Unit>) => Promise<Unit>
  delete: (id: string) => Promise<void>
}
```

### Admin Frontend — `src/services/shopService.ts` (novo)

```typescript
interface ShopHours {
  day: string
  start: string | null
  end: string | null
}

export const shopService = {
  getShop: () => Promise<ShopData>
  updateShop: (data: Partial<ShopData>) => Promise<ShopData>
  getHours: () => Promise<ShopHours[]>
  updateHours: (hours: ShopHours[]) => Promise<ShopHours[]>
}
```

### Admin Frontend — `src/services/dashboardService.ts` (novo)

```typescript
interface DashboardStats {
  revenue: number        // convertido para reais
  appointmentCount: number
  topService: string
  newClients: number
}

interface WeeklyRevenueEntry {
  day: string
  [professionalName: string]: number | string  // valores em reais
}

export const dashboardService = {
  getStats: (date: string) => Promise<DashboardStats>
  getWeeklyRevenue: () => Promise<WeeklyRevenueEntry[]>
}
```

### Admin Frontend — `src/stores/userStore.ts` (modificado)

```typescript
interface UserState {
  isAuthenticated: boolean
  user: UserProfile | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  init: () => void   // restaura sessão do localStorage
}
// login() → POST /admin/auth/login → salva token no localStorage
// logout() → remove token do localStorage
// init() → lê token do localStorage, restaura estado
```

### Admin Frontend — `src/stores/shopStore.ts` (modificado)

```typescript
interface ShopState {
  shop: ShopData
  isLoading: boolean
  loadShop: () => Promise<void>
  saveShop: (data: Partial<ShopData>) => Promise<void>
  updateShop: (data: Partial<ShopData>) => void
}
```

### Admin Frontend — hooks modificados

```typescript
// useClients: search passado como query param, não filtrado localmente
export function useClients(filters?: { search?: string; page?: number; perPage?: number })

// useStaff: unitId passado como query param para o backend
export function useStaff(filters?: { unitId?: string })

// useAppointments: todos os filtros passados como query params
export function useAppointments(filters?: {
  date?: string
  staffId?: string
  status?: string
  serviceId?: string
  clientId?: string
})
```

---

## Data Models

### Transformações de dados

#### Preços (ambos os frontends)

```
Backend (Int, centavos) ──centsToReais()──▶ Frontend (number, reais)
Frontend (number, reais) ──reaisToCents()──▶ Backend (Int, centavos)
```

Campos afetados: `price` (serviços, adicionais, agendamentos), `totalSpent` (clientes), `revenue` (dashboard).

#### Mapeamento Staff ↔ Professional (admin)

```
Backend Professional          Admin StaffMember
─────────────────────         ─────────────────
professionalId        ──▶     id
professionalName      ──▶     name
(demais campos)       ──▶     (mesmos campos)
```

`fromBackendProfessional` aplicado em respostas de `/admin/staff` e `/admin/appointments`.
`toBackendProfessional` aplicado em envios para `/admin/staff` e `/admin/appointments`.

#### Variáveis de ambiente

**trinity-scheduler-client/.env**
```
VITE_API_URL=http://localhost:3000
VITE_SHOP_ID=
```

**trinity-scheduler-admin/.env**
```
VITE_API_URL=http://localhost:3000
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Decodificação base64 do shopId é round-trip

*For any* string não-vazia usada como shopId, codificá-la em base64 e depois decodificá-la via `decodeShopId()` deve retornar o valor original.

**Validates: Requirements 1.2**

---

### Property 2: clientApi inclui X-Shop-Id em todas as requisições

*For any* shopId válido e qualquer path de endpoint, a função `clientApi` deve produzir uma requisição cujo header `X-Shop-Id` seja exatamente igual ao shopId fornecido.

**Validates: Requirements 1.4**

---

### Property 3: adminApi inclui Authorization Bearer em todas as requisições

*For any* JWT token e qualquer path de endpoint protegido, a função `adminApi` deve produzir uma requisição cujo header `Authorization` seja exatamente `"Bearer " + token`.

**Validates: Requirements 2.2**

---

### Property 4: JWT persiste e é restaurado corretamente (round-trip localStorage)

*For any* token JWT retornado pelo backend após login bem-sucedido, após `userStore.login()` e em seguida `userStore.init()` (simulando reinicialização), `isAuthenticated` deve ser `true` e o token no localStorage deve ser igual ao token original.

**Validates: Requirements 2.3, 2.4**

---

### Property 5: Logout remove JWT do localStorage

*For any* sessão autenticada com token no localStorage, após `userStore.logout()`, `localStorage.getItem("trinity_admin_token")` deve retornar `null` e `isAuthenticated` deve ser `false`.

**Validates: Requirements 2.5**

---

### Property 6: Login do cliente armazena clientId (round-trip)

*For any* clientId retornado pelo backend em resposta ao `POST /auth/login`, após `authStore.login()` concluir com sucesso, `localStorage.getItem("trinity_client_id")` deve ser igual ao clientId retornado e `isAuthenticated` deve ser `true`.

**Validates: Requirements 3.2**

---

### Property 7: centsToReais e reaisToCents são inversas (round-trip)

*For any* inteiro não-negativo `cents`, `reaisToCents(centsToReais(cents))` deve ser igual a `cents`. Garante que nenhum valor monetário é perdido ou distorcido na conversão.

**Validates: Requirements 9.1, 9.2, 9.6**

---

### Property 8: reaisToCents arredonda corretamente

*For any* valor em reais com até 2 casas decimais, `reaisToCents(x)` deve retornar `Math.round(x * 100)`, garantindo que valores como `9.99` sejam convertidos para `999` sem erro de ponto flutuante.

**Validates: Requirements 9.5**

---

### Property 9: toBackendProfessional mapeia todos os campos de nomenclatura

*For any* `StaffMember` com `id` e `name` definidos, `toBackendProfessional(staff).professionalId` deve ser igual a `staff.id` e `toBackendProfessional(staff).professionalName` deve ser igual a `staff.name`.

**Validates: Requirements 10.1, 10.2**

---

### Property 10: fromBackendProfessional e toBackendProfessional são inversas (round-trip)

*For any* `StaffMember` válido, `fromBackendProfessional(toBackendProfessional(staff))` deve produzir um objeto com `id` e `name` iguais aos do `staff` original. Garante que o mapeamento não perde informação em nenhuma direção.

**Validates: Requirements 10.3, 10.4**

---

## Error Handling

### Classe de erro

```typescript
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}
```

### Mapeamento de status HTTP

| Status | Comportamento |
|--------|---------------|
| 400    | Lança ApiError com mensagem do backend |
| 401    | Admin: remove token + redireciona para /login |
| 404    | Admin: exibe "Recurso não encontrado" |
| 422    | Lança ApiError com detalhes de validação |
| 5xx    | Lança ApiError com mensagem genérica |
| Network error | Lança ApiError com "Sem conexão com o servidor" |

### Tratamento por camada

- **Services**: lançam `ApiError`, nunca retornam `null` em caso de erro
- **Hooks (React Query)**: expõem `isError` e `error`, não tratam erros diretamente
- **Componentes**: verificam `isError` e renderizam estado de erro com opção de retry via `refetch()`
- **Mutations**: usam `onError` callback para exibir mensagem de erro sem travar a UI

### Client Frontend — ausência do `?ref=`

Se `decodeShopId()` retornar `null`, o app renderiza uma tela de erro bloqueante antes de qualquer requisição, evitando chamadas sem `X-Shop-Id`.

---

## Testing Strategy

### Abordagem dual

Testes unitários focam em exemplos concretos e edge cases. Testes de propriedade cobrem invariantes universais com inputs gerados aleatoriamente. Ambos são necessários e complementares.

**Testes unitários** cobrem:
- Exemplos de integração (ex: login chama o endpoint correto)
- Edge cases (ausência de `?ref=`, resposta 401, lista vazia)
- Comportamento de componentes com estados de loading/error

**Testes de propriedade** cobrem:
- Invariantes matemáticas (conversão de preços)
- Round-trips (base64, JWT, mapeamento staff↔professional)
- Comportamento universal de headers HTTP

### Biblioteca de property-based testing

Ambos os frontends usam **[fast-check](https://github.com/dubzzz/fast-check)** (TypeScript-first, compatível com Vitest).

Cada property test deve rodar com mínimo de **100 iterações**.

Tag de rastreabilidade obrigatória em cada teste de propriedade:

```typescript
// Feature: frontend-backend-integration, Property N: <texto da propriedade>
```

### Mapeamento de propriedades para testes

| Propriedade | Arquivo de teste | Padrão PBT |
|-------------|-----------------|------------|
| P1: base64 round-trip | `src/lib/__tests__/api.test.ts` (client) | Round-trip |
| P2: clientApi X-Shop-Id | `src/lib/__tests__/api.test.ts` (client) | Invariante |
| P3: adminApi Authorization | `src/lib/__tests__/api.test.ts` (admin) | Invariante |
| P4: JWT localStorage round-trip | `src/stores/__tests__/userStore.test.ts` | Round-trip |
| P5: Logout remove JWT | `src/stores/__tests__/userStore.test.ts` | Invariante pós-operação |
| P6: clientId round-trip | `src/stores/__tests__/authStore.test.ts` | Round-trip |
| P7: cents↔reais round-trip | `src/lib/__tests__/price.test.ts` (client) | Round-trip |
| P8: reaisToCents arredondamento | `src/utils/__tests__/price.test.ts` (admin) | Invariante matemática |
| P9: toBackendProfessional mapeamento | `src/lib/__tests__/mappers.test.ts` (admin) | Invariante |
| P10: staff↔professional round-trip | `src/lib/__tests__/mappers.test.ts` (admin) | Round-trip |

### Exemplos de testes unitários prioritários

- `clientApi` lança `ApiError` quando `response.ok === false`
- `adminApi` redireciona para `/login` em resposta 401
- `decodeShopId()` retorna `null` quando `?ref=` está ausente
- `getServices()` aplica `centsToReais` em todos os itens retornados
- `staffService.getAll({ unitId })` passa `unitId` como query param (não filtra localmente)
- `useClients({ search })` passa `search` como query param (não filtra localmente)
- `dashboardService.getStats()` converte `revenue` de cents para reais
