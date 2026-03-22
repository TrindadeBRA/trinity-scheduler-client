import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useAppointments } from "../hooks/useAppointments";
import { MobileLayout } from "../components/layout/MobileLayout";
import { AppointmentSkeleton } from "../components/ui/AppointmentSkeleton";
import { Skeleton } from "../components/ui/Skeleton";
import { formatCurrency } from "../lib/utils";
import type { Appointment } from "../lib/types";
import texts from "../config/texts.json";
import { Calendar, Clock, User, ChevronRight, CalendarX, CircleCheck, CircleDot } from "lucide-react";

const t = texts.agendamentos;

const STATUS_CONFIG: Record<Appointment["status"], { label: string; icon: typeof CircleDot; className: string }> = {
  confirmed: { label: "Confirmado", icon: CircleDot, className: "text-primary bg-primary/10" },
  cancelled: { label: "Cancelado", icon: CalendarX, className: "text-destructive bg-destructive/10" },
  completed: { label: "Concluído", icon: CircleCheck, className: "text-muted-foreground bg-secondary" },
};

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split("T")[0];
}

function formatShortDate(dateStr: string) {
  if (isToday(dateStr)) return t.hoje;
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatWeekday(dateStr: string) {
  if (isToday(dateStr)) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const wd = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return wd.charAt(0).toUpperCase() + wd.slice(1);
}

function AppointmentCard({ appointment, clickable }: { appointment: Appointment; clickable: boolean }) {
  const navigate = useNavigate();
  const handleClick = () => clickable && navigate(`/meus-agendamentos/${appointment.id}`);
  const config = STATUS_CONFIG[appointment.status];
  const StatusIcon = config.icon;

  return (
    <div
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === "Enter" && handleClick() : undefined}
      className={`rounded-lg border border-border bg-card transition-all ${clickable ? "cursor-pointer hover:border-primary/40 hover:shadow-sm active:scale-[0.99]" : "opacity-80"}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-card-foreground truncate">{appointment.serviceName}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs truncate">{appointment.professionalName}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0 ${config.className}`}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatShortDate(appointment.date)}
              {formatWeekday(appointment.date) && <span className="hidden sm:inline">· {formatWeekday(appointment.date)}</span>}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {appointment.time} · {appointment.duration}min
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-primary">{formatCurrency(appointment.price)}</span>
            {clickable && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, appointments, clickable, emptyText }: { title: string; appointments: Appointment[]; clickable: boolean; emptyText: string }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-display font-semibold text-foreground uppercase tracking-wide">{title}</h2>
        {appointments.length > 0 && (
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{appointments.length}</span>
        )}
      </div>
      {appointments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((a) => <AppointmentCard key={a.id} appointment={a} clickable={clickable} />)}
        </div>
      )}
    </section>
  );
}

export function AppointmentsPage() {
  const clientId = useAuthStore((s) => s.clientId);
  const { upcoming, past, isLoading } = useAppointments(clientId);

  return (
    <MobileLayout>
      <h1 className="text-xl font-display font-bold mb-6 text-foreground">{t.titulo}</h1>
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <AppointmentSkeleton count={2} />
          <Skeleton className="h-4 w-20 mb-3 mt-4" />
          <AppointmentSkeleton count={2} />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <Section title={t.proximos} appointments={upcoming} clickable emptyText={t.vazioProximos} />
          <Section title={t.anteriores} appointments={past} clickable={false} emptyText={t.vazioHistorico} />
        </div>
      )}
    </MobileLayout>
  );
}
