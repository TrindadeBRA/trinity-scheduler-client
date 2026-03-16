import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useBookingStore } from '../../stores/bookingStore';
import { useAvailableSlots } from '../../hooks/useAvailableSlots';
import { TimeSlotGrid } from './TimeSlotGrid';
import texts from '../../config/texts.json';

function generateNext30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

function formatDayLabel(dateStr: string): { weekday: string; day: string; month: string } {
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

  const { selectedProfessional, setDateTime, nextStep } = useBookingStore();
  const professionalId = selectedProfessional?.id ?? null;

  const { slots, disabledDates, isLoading } = useAvailableSlots(professionalId, selectedDate);

  const days = generateNext30Days();
  const { titulo, subtitulo } = texts.booking.dataHorario;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      setDateTime(selectedDate, time);
      nextStep();
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
          {titulo}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
          {subtitulo}
        </p>
      </div>

      {/* Date picker — scrollable row */}
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
                  disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'
                )}
                style={
                  selected
                    ? {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-primary-foreground)',
                        borderColor: 'var(--color-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-background)',
                        color: disabled ? 'var(--color-muted-foreground)' : 'var(--color-foreground)',
                        borderColor: 'var(--color-border)',
                      }
                }
              >
                <span className="text-xs capitalize">{weekday}</span>
                <span className="text-lg font-bold leading-tight">{day}</span>
                <span className="text-xs capitalize">{month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="flex flex-col gap-2">
          <TimeSlotGrid
            slots={slots}
            selectedTime={selectedTime}
            onSelect={handleTimeSelect}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
