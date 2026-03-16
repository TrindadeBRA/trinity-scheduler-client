import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useAppointments } from "../hooks/useAppointments";
import { MobileLayout } from "../components/layout/MobileLayout";
import { SkeletonList } from "../components/ui/SkeletonList";
import { formatDate, formatTime } from "../lib/utils";
import type { Appointment } from "../lib/types";
import texts from "../config/texts.json";

const t = texts.agendamentos;

const STATUS_LABELS: Record<Appointment["status"], string> = {
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

const STATUS_COLORS: Record<Appointment["status"], string> = {
  confirmed: "var(--color-primary)",
  cancelled: "var(--color-destructive)",
  completed: "var(--color-muted-foreground)",
};

interface AppointmentItemProps {
  appointment: Appointment;
  clickable: boolean;
}

function AppointmentItem({ appointment, clickable }: AppointmentItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (clickable) {
      navigate(`/appointments/${appointment.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === "Enter" && handleClick() : undefined}
      className="rounded-lg p-4 mb-3 border transition-colors"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-border)",
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: "var(--color-foreground)" }}>
            {appointment.serviceName}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            {appointment.professionalName}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            {formatDate(appointment.date)} · {formatTime(appointment.time)}
          </p>
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
          style={{
            color: STATUS_COLORS[appointment.status],
            backgroundColor: "var(--color-background)",
            border: `1px solid ${STATUS_COLORS[appointment.status]}`,
          }}
        >
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  appointments: Appointment[];
  clickable: boolean;
}

function Section({ title, appointments, clickable }: SectionProps) {
  return (
    <section className="mb-6">
      <h2
        className="text-base font-semibold mb-3"
        style={{ color: "var(--color-foreground)" }}
      >
        {title}
      </h2>
      {appointments.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          {t.vazio}
        </p>
      ) : (
        appointments.map((a) => (
          <AppointmentItem key={a.id} appointment={a} clickable={clickable} />
        ))
      )}
    </section>
  );
}

export function AppointmentsPage() {
  const clientId = useAuthStore((s) => s.clientId);
  const { upcoming, past, isLoading } = useAppointments(clientId);

  return (
    <MobileLayout>
      <h1
        className="text-xl font-bold mb-6"
        style={{ color: "var(--color-foreground)" }}
      >
        {t.titulo}
      </h1>

      {isLoading ? (
        <SkeletonList count={3} itemClassName="h-24 mb-3 rounded-lg" />
      ) : (
        <>
          <Section title={t.proximos} appointments={upcoming} clickable={true} />
          <Section title={t.anteriores} appointments={past} clickable={false} />
        </>
      )}
    </MobileLayout>
  );
}
