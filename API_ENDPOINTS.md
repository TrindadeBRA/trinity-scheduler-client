# API Endpoints — Trinity Scheduler Client

## 1. Autenticação

### POST /auth/login
Autentica o cliente pelo telefone.

**Request:**
```json
{
  "phone": "11999999999"
}
```

**Response:**
```json
{
  "clientId": "client-001"
}
```

**Usado em:** `LoginPage` → `authService.login()`

---

## 2. Serviços

### GET /services
Lista todos os serviços disponíveis para agendamento.

**Response:**
```json
[
  {
    "id": "svc-1",
    "name": "Corte Masculino",
    "duration": 30,
    "price": 45.0,
    "description": "Corte completo com máquina e tesoura",
    "icon": "Scissors",
    "image": "https://..."
  }
]
```

**Usado em:** `BookingWizard > ServiceSelection` → `useServices()` → `serviceService.getServices()`

---

## 3. Serviços Adicionais

### GET /addons
Lista os serviços adicionais (complementos opcionais ao serviço principal).

**Response:**
```json
[
  {
    "id": "add-1",
    "name": "Sobrancelha",
    "duration": 10,
    "price": 15.0,
    "image": "https://..."
  }
]
```

**Usado em:** `BookingWizard > ServiceSelection` (atualmente importa direto do mock `mockAddons`)

> ⚠️ Ainda não possui service dedicado. Precisa criar `addonService.ts` com `getAddons()`.

---

## 4. Profissionais

### GET /professionals
Lista todos os profissionais disponíveis.

**Response:**
```json
[
  {
    "id": "pro-1",
    "name": "Carlos",
    "avatar": "https://...",
    "specialties": ["Corte", "Barba"]
  }
]
```

**Usado em:** `BookingWizard > ProfessionalSelection` → `useProfessionals()` → `professionalService.getProfessionals()`

---

## 5. Disponibilidade

### GET /availability/slots?professionalId={id}&date={YYYY-MM-DD}
Retorna os horários disponíveis de um profissional em uma data específica.

- Se `professionalId` for `null`, retorna a união de disponibilidade de todos os profissionais.

**Response:**
```json
[
  { "time": "09:00", "available": true },
  { "time": "09:30", "available": false },
  { "time": "10:00", "available": true }
]
```

**Usado em:** `BookingWizard > DateTimeSelection` → `useAvailableSlots()` → `availabilityService.getAvailableSlots()`

---

### GET /availability/disabled-dates?professionalId={id}
Retorna as datas que estão totalmente indisponíveis para um profissional.

- Se `professionalId` for `null`, uma data só é desabilitada se TODOS os profissionais estiverem indisponíveis.

**Response:**
```json
["2026-03-25", "2026-03-30"]
```

**Usado em:** `BookingWizard > DateTimeSelection` → `useAvailableSlots()` → `availabilityService.getDisabledDates()`

---

## 6. Agendamentos

### POST /appointments
Cria um novo agendamento.

**Request:**
```json
{
  "clientId": "client-001",
  "serviceId": "svc-1",
  "professionalId": "pro-1",
  "date": "2026-03-25",
  "time": "10:00"
}
```

> `professionalId` pode ser `null` (sem preferência).

**Response:**
```json
{
  "id": "apt-123",
  "clientId": "client-001",
  "serviceId": "svc-1",
  "serviceName": "Corte Masculino",
  "professionalId": "pro-1",
  "professionalName": "Carlos",
  "date": "2026-03-25",
  "time": "10:00",
  "duration": 30,
  "price": 45.0,
  "status": "confirmed"
}
```

**Usado em:** `BookingConfirmation` → `useCreateAppointment()` → `appointmentService.createAppointment()`

---

### GET /appointments?clientId={id}
Lista todos os agendamentos de um cliente.

**Response:**
```json
[
  {
    "id": "apt-123",
    "clientId": "client-001",
    "serviceId": "svc-1",
    "serviceName": "Corte Masculino",
    "professionalId": "pro-1",
    "professionalName": "Carlos",
    "date": "2026-03-25",
    "time": "10:00",
    "duration": 30,
    "price": 45.0,
    "status": "confirmed",
    "cancelReason": null
  }
]
```

**Usado em:** `AppointmentsPage` e `AppointmentDetailPage` → `useAppointments()` → `appointmentService.getAppointments()`

---

### PATCH /appointments/{id}/cancel
Cancela um agendamento existente.

**Request:**
```json
{
  "reason": "Não poderei comparecer"
}
```

**Response:** `204 No Content`

**Usado em:** `AppointmentDetailPage` → `useCancelAppointment()` → `appointmentService.cancelAppointment()`

---

## Resumo

| # | Método | Endpoint                              | Descrição                          |
|---|--------|---------------------------------------|------------------------------------|
| 1 | POST   | `/auth/login`                         | Login por telefone                 |
| 2 | GET    | `/services`                           | Listar serviços                    |
| 3 | GET    | `/addons`                             | Listar serviços adicionais         |
| 4 | GET    | `/professionals`                      | Listar profissionais               |
| 5 | GET    | `/availability/slots`                 | Horários disponíveis por data      |
| 6 | GET    | `/availability/disabled-dates`        | Datas indisponíveis                |
| 7 | POST   | `/appointments`                       | Criar agendamento                  |
| 8 | GET    | `/appointments?clientId={id}`         | Listar agendamentos do cliente     |
| 9 | PATCH  | `/appointments/{id}/cancel`           | Cancelar agendamento               |
