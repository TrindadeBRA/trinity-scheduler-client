import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useBookingStore } from '../../stores/bookingStore';
import { useAvailableSlots } from '../../hooks/useAvailableSlots';
import { TimeSlotGrid } from './TimeSlotGrid';
import { Button } from '../ui/Button';
import texts from '../../config/texts.json';

function generateNext30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return days;
}

function formatDayLabel(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return {
    weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
    day: String(day),
    month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
  };
}

export function DateTimeSelection() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { selectedProfessional, selectedService, selectedAddons, setDateTime, nextStep } = useBookingStore();
  const totalDuration = (selectedService?.duration ?? 30) + selectedAddons.reduce((sum, a) => sum + a.duration, 0);
  const { slots, disabledDates, isLoading, isError } = useAvailableSlots(selectedProfessional?.id ?? null, selectedDate, totalDuration);
  const days = generateNext30Days();

  useEffect(() => {
    if (!selectedDate && days.length > 0) {
      const firstAvailable = days.find((d) => !disabledDates.includes(d)) ?? days[0];
      setSelectedDate(firstAvailable);
    }
  }, [disabledDates, days.length]);

  const handleDateSelect = (date: string) => { setSelectedDate(date); setSelectedTime(null); };
  const handleTimeSelect = (time: string) => { setSelectedTime(time); };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      setDateTime(selectedDate, selectedTime);
      nextStep();
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">{texts.booking.dataHorario.titulo}</h2>
        <p className="text-sm mt-1 text-muted-foreground">{texts.booking.dataHorario.subtitulo}</p>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {days.map((date) => {
            const disabled = disabledDates.includes(date);
            const selected = selectedDate === date;
            const { weekday, day, month } = formatDayLabel(date);
            return (
              <button
                key={date}
                disabled={disabled}
                onClick={() => !disabled && handleDateSelect(date)}
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[56px] transition-colors border',
                  disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80',
                  selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border',
                  disabled && !selected && 'text-muted-foreground'
                )}
              >
                <span className="text-xs capitalize">{weekday}</span>
                <span className="text-lg font-bold leading-tight">{day}</span>
                <span className="text-xs capitalize">{month}</span>
              </button>
            );
          })}
        </div>
      </div>
      {selectedDate && <TimeSlotGrid slots={slots} selectedTime={selectedTime} onSelect={handleTimeSelect} isLoading={isLoading} isError={isError} />}
      {selectedDate && selectedTime && (
        <Button variant="primary" onClick={handleContinue} className="mt-2">
          {texts.booking.dataHorario.botaoContinuar}
        </Button>
      )}
    </div>
  );
}
