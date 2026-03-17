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
  const selectedAddons = useBookingStore((s) => s.selectedAddons);
  const selectedProfessional = useBookingStore((s) => s.selectedProfessional);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedTime = useBookingStore((s) => s.selectedTime);
  const prevStep = useBookingStore((s) => s.prevStep);
  const clientId = useAuthStore((s) => s.clientId);
  const { mutate, isPending, isError } = useCreateAppointment();

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = (selectedService?.price ?? 0) + addonsTotal;
  const totalDuration = (selectedService?.duration ?? 0) + selectedAddons.reduce((sum, a) => sum + a.duration, 0);

  const handleConfirm = () => {
    if (!clientId || !selectedService || !selectedDate || !selectedTime) return;
    mutate(
      { clientId, serviceId: selectedService.id, professionalId: selectedProfessional?.id ?? null, date: selectedDate, time: selectedTime },
      { onSuccess: (appointment) => navigate('/booking/success', { state: { appointment } }) }
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 text-foreground">
      <h2 className="text-xl font-display font-semibold">{texts.booking.confirmacao.titulo}</h2>
      <div className="rounded-lg p-4 flex flex-col gap-3 bg-card border border-border">
        {selectedService && (
          <>
            <Row label="Serviço" value={selectedService.name} />
            <Row label="Duração" value={`${selectedService.duration} min`} />
            <Row label="Preço" value={formatCurrency(selectedService.price)} />
          </>
        )}
        {selectedAddons.length > 0 && (
          <>
            <div className="border-t border-border my-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Adicionais</span>
            {selectedAddons.map((addon) => (
              <Row key={addon.id} label={`${addon.name} (${addon.duration} min)`} value={formatCurrency(addon.price)} />
            ))}
          </>
        )}
        <div className="border-t border-border my-1" />
        <Row label="Profissional" value={selectedProfessional?.name ?? texts.booking.profissional.semPreferencia} />
        {selectedDate && <Row label="Data" value={formatDate(selectedDate)} />}
        {selectedTime && <Row label="Horário" value={selectedTime} />}
        <div className="border-t border-border my-1" />
        <Row label="Duração total" value={`${totalDuration} min`} />
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-base font-bold text-primary">{formatCurrency(totalPrice)}</span>
        </div>
      </div>
      {isError && <p className="text-sm text-center text-destructive">{texts.geral.erro}</p>}
      <div className="flex flex-col gap-3">
        <Button variant="primary" loading={isPending} onClick={handleConfirm} disabled={isPending}>
          {texts.booking.confirmacao.botaoConfirmar}
        </Button>
        {isError && (
          <Button variant="secondary" onClick={handleConfirm} disabled={isPending}>
            {texts.geral.tentarNovamente}
          </Button>
        )}
        <Button variant="ghost" onClick={prevStep} disabled={isPending}>
          {texts.booking.confirmacao.botaoVoltar}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
