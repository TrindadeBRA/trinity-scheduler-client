import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { useCreateAppointment } from '../../hooks/useCreateAppointment';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils';
import texts from '../../config/texts.json';
import { Calendar, Clock, User, Scissors } from 'lucide-react';

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
      { clientId, serviceId: selectedService.id, professionalId: selectedProfessional?.id ?? null, addonIds: selectedAddons.map((a) => a.id), date: selectedDate, time: selectedTime },
      { onSuccess: (appointment) => navigate('/booking/success', { state: { appointment, addons: selectedAddons } }) }
    );
  };

  return (
    <div className="flex flex-col gap-5 p-4 text-foreground">
      <h2 className="text-xl font-display font-semibold">{texts.booking.confirmacao.titulo}</h2>

      {/* Serviço principal */}
      {selectedService && (
        <div className="flex items-center gap-3 rounded-lg p-3 bg-card border border-border">
          {selectedService.image ? (
            <img src={selectedService.image} alt={selectedService.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{selectedService.name}</p>
            <p className="text-xs text-muted-foreground">{selectedService.duration} min</p>
          </div>
          <span className="text-sm font-semibold text-primary shrink-0">{formatCurrency(selectedService.price)}</span>
        </div>
      )}

      {/* Adicionais */}
      {selectedAddons.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-3 py-2 bg-secondary/50">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Adicionais</span>
          </div>
          <div className="divide-y divide-border">
            {selectedAddons.map((addon) => (
              <div key={addon.id} className="flex items-center gap-3 px-3 py-2.5 bg-card">
                {addon.image ? (
                  <img src={addon.image} alt={addon.name} className="h-8 w-8 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-md bg-warning/10 flex items-center justify-center shrink-0">
                    <Scissors className="h-3.5 w-3.5 text-warning" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{addon.name}</p>
                  <p className="text-[11px] text-muted-foreground">{addon.duration} min</p>
                </div>
                <span className="text-sm font-medium text-primary shrink-0">{formatCurrency(addon.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data, horário e profissional */}
      <div className="rounded-lg bg-card border border-border divide-y divide-border">
        {/* Profissional */}
        <div className="flex items-center gap-3 p-3">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            {selectedProfessional?.avatar ? (
              <img src={selectedProfessional.avatar} alt={selectedProfessional.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Profissional</p>
            <p className="text-sm font-semibold">{selectedProfessional?.name ?? texts.booking.profissional.semPreferencia}</p>
          </div>
        </div>

        {/* Data e Horário */}
        <div className="grid grid-cols-2 divide-x divide-border">
          {selectedDate && (
            <div className="flex items-center gap-2.5 p-3">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Data</p>
                <p className="text-sm font-semibold">{formatDate(selectedDate)}</p>
              </div>
            </div>
          )}
          {selectedTime && (
            <div className="flex items-center gap-2.5 p-3">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Horário</p>
                <p className="text-sm font-semibold">{selectedTime}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumo total */}
      <div className="rounded-lg p-4 bg-primary/5 border border-primary/20">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Duração total</span>
          <span className="text-xs text-muted-foreground">{totalDuration} min</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(totalPrice)}</span>
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
