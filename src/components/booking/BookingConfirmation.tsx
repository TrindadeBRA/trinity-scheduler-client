import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { useCreateAppointment } from '../../hooks/useCreateAppointment';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils';
import texts from '../../config/texts.json';

export function BookingConfirmation() {
  const navigate = useNavigate();

  const selectedService = useBookingStore((s) => s.selectedService);
  const selectedProfessional = useBookingStore((s) => s.selectedProfessional);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedTime = useBookingStore((s) => s.selectedTime);
  const prevStep = useBookingStore((s) => s.prevStep);

  const clientId = useAuthStore((s) => s.clientId);

  const { mutate, isPending, isError } = useCreateAppointment();

  const handleConfirm = () => {
    if (!clientId || !selectedService || !selectedDate || !selectedTime) return;

    mutate(
      {
        clientId,
        serviceId: selectedService.id,
        professionalId: selectedProfessional?.id ?? null,
        date: selectedDate,
        time: selectedTime,
      },
      {
        onSuccess: (appointment) => {
          navigate('/booking/success', { state: { appointment } });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4" style={{ color: 'var(--color-foreground)' }}>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
        {texts.booking.confirmacao.titulo}
      </h2>

      <div
        className="rounded-lg p-4 flex flex-col gap-3"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {selectedService && (
          <>
            <SummaryRow label="Serviço" value={selectedService.name} />
            <SummaryRow label="Duração" value={`${selectedService.duration} min`} />
            <SummaryRow label="Preço" value={formatCurrency(selectedService.price)} />
          </>
        )}

        <SummaryRow
          label="Profissional"
          value={selectedProfessional?.name ?? texts.booking.profissional.semPreferencia}
        />

        {selectedDate && (
          <SummaryRow label="Data" value={formatDate(selectedDate)} />
        )}

        {selectedTime && (
          <SummaryRow label="Horário" value={selectedTime} />
        )}
      </div>

      {isError && (
        <p
          className="text-sm text-center"
          style={{ color: 'var(--color-destructive)' }}
        >
          {texts.geral.erro}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          loading={isPending}
          onClick={handleConfirm}
          disabled={isPending}
        >
          {texts.booking.confirmacao.botaoConfirmar}
        </Button>

        {isError && (
          <Button
            variant="secondary"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {texts.geral.tentarNovamente}
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={isPending}
        >
          {texts.booking.confirmacao.botaoVoltar}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
        {value}
      </span>
    </div>
  );
}
