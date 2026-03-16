import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useBookingStore } from '../stores/bookingStore';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatDate } from '../lib/utils';
import texts from '../config/texts.json';
import type { Appointment } from '../lib/types';

export function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const reset = useBookingStore((s) => s.reset);

  const appointment: Appointment | undefined = location.state?.appointment;

  const handleBookAgain = () => {
    reset();
    navigate('/booking');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <CheckCircle
          size={64}
          style={{ color: 'var(--color-primary)' }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            {texts.booking.sucesso.titulo}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {texts.booking.sucesso.mensagem}
          </p>
        </div>

        {appointment && (
          <div
            className="w-full rounded-lg p-4 flex flex-col gap-3 text-left"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <DetailRow label="Serviço" value={appointment.serviceName} />
            <DetailRow label="Profissional" value={appointment.professionalName} />
            <DetailRow label="Data" value={formatDate(appointment.date)} />
            <DetailRow label="Horário" value={appointment.time} />
            <DetailRow label="Preço" value={formatCurrency(appointment.price)} />
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={handleBookAgain}
        >
          {texts.booking.sucesso.botaoNovo}
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
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
