import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useAppointments } from "../hooks/useAppointments";
import { useCancelAppointment } from "../hooks/useCancelAppointment";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { formatDate, formatTime, formatCurrency } from "../lib/utils";
import texts from "../config/texts.json";

const t = texts.agendamentos;
const tGeral = texts.geral;

const STATUS_LABELS = {
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
} as const;

const STATUS_COLORS = {
  confirmed: "var(--color-primary)",
  cancelled: "var(--color-destructive)",
  completed: "var(--color-muted-foreground)",
} as const;

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = useAuthStore((s) => s.clientId);
  const { upcoming, past, isLoading } = useAppointments(clientId);
  const { mutate: cancelMutate, isPending, isError } = useCancelAppointment();

  const [dialogOpen, setDialogOpen] = useState(false);

  const all = [...upcoming, ...past];
  const appointment = all.find((a) => a.id === id);

  const today = new Date().toISOString().split("T")[0];
  const canCancel =
    appointment?.status === "confirmed" && appointment.date >= today;

  const handleCancelConfirm = () => {
    if (!appointment) return;
    cancelMutate(appointment.id, {
      onSuccess: () => {
        setDialogOpen(false);
        navigate("/appointments");
      },
    });
  };

  return (
    <MobileLayout>
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/appointments")}
          className="px-0"
        >
          ← Agendamentos
        </Button>
      </div>

      {isLoading ? (
        <div
          className="text-sm"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {tGeral.carregando}
        </div>
      ) : !appointment ? (
        <div
          className="text-sm"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {tGeral.erro}
        </div>
      ) : (
        <div
          className="rounded-lg border p-5 space-y-4"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <h1
              className="text-lg font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              {appointment.serviceName}
            </h1>
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

          <DetailRow label="Profissional" value={appointment.professionalName} />
          <DetailRow label="Data" value={formatDate(appointment.date)} />
          <DetailRow label="Horário" value={formatTime(appointment.time)} />
          <DetailRow label="Duração" value={`${appointment.duration} min`} />
          <DetailRow label="Valor" value={formatCurrency(appointment.price)} />

          {isError && (
            <p
              className="text-sm"
              style={{ color: "var(--color-destructive)" }}
            >
              {tGeral.erro}
            </p>
          )}

          {canCancel && (
            <Button
              variant="secondary"
              className="w-full mt-2"
              onClick={() => setDialogOpen(true)}
              loading={isPending}
            >
              {t.cancelar}
            </Button>
          )}
        </div>
      )}

      <Dialog
        isOpen={dialogOpen}
        title={t.cancelar}
        message={t.confirmarCancelamento}
        confirmLabel={t.cancelar}
        cancelLabel="Voltar"
        onConfirm={handleCancelConfirm}
        onCancel={() => setDialogOpen(false)}
      />
    </MobileLayout>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between gap-4">
      <span
        className="text-sm"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium text-right"
        style={{ color: "var(--color-foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}
