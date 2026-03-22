import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, CalendarPlus, CalendarDays, Clock, Timer, User, Scissors, DollarSign, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatDate, buildGoogleCalendarUrl } from '../lib/utils';
import texts from '../config/texts.json';
import niche from '../config/niche.json';
import type { Appointment, AddonService } from '../lib/types';

export function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment: Appointment | undefined = location.state?.appointment;
  const addons: AddonService[] = location.state?.addons ?? [];

  const total = appointment?.price ?? 0;

  const calendarUrl = appointment
    ? buildGoogleCalendarUrl(
        `${appointment.serviceName} — ${niche.businessName}`,
        appointment.date,
        appointment.time,
        appointment.duration,
        `Profissional: ${appointment.professionalName}`
      )
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <CheckCircle size={64} className="text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-bold">{texts.booking.sucesso.titulo}</h1>
          <p className="text-sm text-muted-foreground">{texts.booking.sucesso.mensagem}</p>
        </div>
        {appointment && (
          <div className="w-full flex flex-col gap-3 text-left">
            {/* Data e horário */}
            <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium capitalize">{formatDate(appointment.date)}</span>
                <div className="flex items-center gap-3 text-muted-foreground text-xs mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {appointment.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" aria-hidden="true" />
                    {appointment.duration} min
                  </span>
                </div>
              </div>
            </div>

            {/* Profissional */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon={<User className="h-4 w-4" aria-hidden="true" />} label="Profissional">
                <span className="text-sm font-medium break-words">{appointment.professionalName}</span>
              </InfoCard>
              <InfoCard icon={<Scissors className="h-4 w-4" aria-hidden="true" />} label="Serviço">
                <span className="text-sm font-medium break-words">{appointment.serviceName}</span>
              </InfoCard>
            </div>

            {/* Adicionais */}
            {addons.length > 0 && (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-xs font-medium uppercase tracking-wide">Adicionais</span>
                </div>
                <div className="space-y-1.5">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between text-sm gap-2">
                      <span className="truncate">{addon.name}</span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {addon.duration > 0 ? `+${addon.duration}min · ` : ''}{formatCurrency(addon.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valor total */}
            <InfoCard icon={<DollarSign className="h-4 w-4" aria-hidden="true" />} label="Valor total">
              <span className="text-sm font-semibold text-primary">{formatCurrency(total)}</span>
            </InfoCard>
          </div>
        )}
        <div className="w-full flex flex-col gap-3">
          {calendarUrl && (
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="secondary" className="w-full gap-2">
                <CalendarPlus size={18} aria-hidden="true" />
                {texts.booking.sucesso.botaoAgenda}
              </Button>
            </a>
          )}
          <Button variant="primary" className="w-full" onClick={() => navigate('/meus-agendamentos')}>{texts.booking.sucesso.botaoAgendamentos}</Button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1 min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
