export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description: string;
  icon?: string; // Lucide icon name
  image?: string; // URL
}

export interface AddonService {
  id: string;
  name: string;
  duration: number;
  price: number;
  image?: string; // URL
}

export interface Professional {
  id: string;
  name: string;
  avatar: string; // URL or placeholder
  specialties: string[];
}

export interface TimeSlot {
  time: string; // "09:00", "09:30", etc.
  available: boolean;
}

export interface DayAvailability {
  date: string; // "2025-03-15"
  slots: TimeSlot[];
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: "confirmed" | "cancelled" | "completed";
  cancelReason?: string;
}

export interface CreateAppointmentPayload {
  clientId: string;
  serviceId: string;
  professionalId: string | null; // null = no preference
  addonIds?: string[];
  date: string;
  time: string;
  unitId?: string | null;
}

export interface NicheConfig {
  businessName: string;
  logo: string; // path to logo
  niche: string; // "barbearia", "salao", "clinica"
  currency: string; // "BRL"
  locale: string; // "pt-BR"
}

export interface AppTexts {
  login: {
    titulo: string;
    subtitulo: string;
    placeholder: string;
    botaoEntrar: string;
  };
  booking: {
    etapas: string[];
    servico: { titulo: string; subtitulo: string };
    profissional: { titulo: string; subtitulo: string; semPreferencia: string };
    dataHorario: { titulo: string; subtitulo: string; semHorarios: string };
    confirmacao: { titulo: string; botaoConfirmar: string; botaoVoltar: string };
    sucesso: { titulo: string; mensagem: string; botaoNovo: string };
  };
  agendamentos: {
    titulo: string;
    proximos: string;
    anteriores: string;
    cancelar: string;
    confirmarCancelamento: string;
    vazio: string;
  };
  validacao: {
    apenasNumeros: string;
    telefoneMinimo: string;
    telefoneMaximo: string;
  };
  geral: {
    carregando: string;
    erro: string;
    tentarNovamente: string;
    sair: string;
  };
}
