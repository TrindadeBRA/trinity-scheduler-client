import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useAppointments } from "../hooks/useAppointments";
import { useCancelAppointment } from "../hooks/useCancelAppointment";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Button } from "../components/ui/Button";
import { formatDate, formatTime, formatCurrency } from "../lib/utils";
import texts from "../config/texts.json";
import { ArrowLeft, Calendar, Clock, User, DollarSign, Scissors, CalendarX, CircleCheck, CircleDot, AlertTriangle, MessageSquare } from "lucide-react";

const t = texts.agendamentos;
const tGeral = texts.geral;

const STATUS_CONFIG = {
  confirmed: { label: "Confirmado", icon: CircleDot, className: "text-primary bg-primary/10 border-primary/20" },
  cancelled: { label: "Cancelado", icon: CalendarX, className: "text-destructive bg-destructive/10 border-destructive/20" },
  completed: { label: "Concluído", icon: CircleCheck, className: "text-muted-foreground bg-secondary border-border" },
} as const;

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = useAuthStore((s) => s.clientId);
  const { upcoming, past, isLoading } = useAppointments(clientId);
  const { mutate: cancelMutate, isPending, isError } = useCancelAppointment();
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  const appointment = [...upcoming, ...past].find((a) => a.id === id);
  const today = new Date().toISOString().split("T")[0];
  const canCancel = appointment?.status === "confirmed" && appointment.date >= today;

  const handleCancelSubmit = () => {
    const trimmed = cancelReason.trim();
    if (!trimmed) {
      setReasonError(true);
      return;
    }
    if (!appointment) return;
    cancelMutate(appointment.id, {
      onSuccess: () => navigate("/appointments"),
    });
  };

  const config = appointment ? STATUS_CONFIG[appointment.status] : null;
  const StatusIcon = config?.icon;

  return (
    <MobileLayout>
      <button
        onClick={() => navigate("/appointments")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Agendamentos
      </button>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">{tGeral.carregando}</div>
      ) : !appointment ? (
        <div className="text-sm text-muted-foreground">{tGeral.erro}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-display font-bold text-foreground">{appointment.serviceName}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">com {appointment.professionalName}</p>
              </div>
              {config && StatusIcon && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {config.label}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <DetailRow icon={<Scissors className="h-4 w-4" />} label="Serviço" value={appointment.serviceName} />
            <DetailRow icon={<User className="h-4 w-4" />} label="Profissional" value={appointment.professionalName} />
            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Data" value={formatDate(appointment.date)} />
            <DetailRow icon={<Clock className="h-4 w-4" />} label="Horário" value={`${formatTime(appointment.time)} · ${appointment.duration} min`} />
            <div className="border-t border-border pt-3">
              <DetailRow icon={<DollarSign className="h-4 w-4" />} label="Valor" value={formatCurrency(appointment.price)} highlight />
            </div>
          </div>

          {/* Cancel reason display */}
          {appointment.status === "cancelled" && appointment.cancelReason && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-destructive mb-1">{t.motivoCancelamento}</p>
                  <p className="text-sm text-foreground">{appointment.cancelReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cancel action */}
          {canCancel && !showCancelForm && (
            <Button variant="secondary" className="w-full" onClick={() => setShowCancelForm(true)}>
              <CalendarX className="h-4 w-4" />
              {t.cancelar}
            </Button>
          )}

          {canCancel && showCancelForm && (
            <div className="rounded-lg border border-destructive/20 bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-sm font-semibold">{t.confirmarCancelamento}</h3>
              </div>
              <div>
                <textarea
                  value={cancelReason}
                  onChange={(e) => { setCancelReason(e.target.value); setReasonError(false); }}
                  placeholder={t.justificativaPlaceholder}
                  rows={3}
                  className={`w-full rounded-lg border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                    reasonError ? "border-destructive" : "border-border"
                  }`}
                />
                {reasonError && (
                  <p className="text-xs text-destructive mt-1">{t.justificativaObrigatoria}</p>
                )}
              </div>
              {isError && <p className="text-sm text-destructive">{tGeral.erro}</p>}
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => { setShowCancelForm(false); setCancelReason(""); setReasonError(false); }}>
                  Voltar
                </Button>
                <Button variant="primary" className="flex-1 bg-destructive text-destructive-foreground hover:opacity-90" loading={isPending} disabled={!cancelReason.trim()} onClick={handleCancelSubmit}>
                  Confirmar cancelamento
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </MobileLayout>
  );
}

function DetailRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm text-right ${highlight ? "font-bold text-primary" : "font-medium text-foreground"}`}>{value}</span>
    </div>
  );
}
