import { cn } from '../../lib/utils';
import { SkeletonList } from '../ui/SkeletonList';
import type { TimeSlot } from '../../lib/types';
import texts from '../../config/texts.json';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  isLoading: boolean;
}

export function TimeSlotGrid({ slots, selectedTime, onSelect, isLoading }: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <SkeletonList count={9} itemClassName="h-10 rounded-lg" />
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  if (availableSlots.length === 0) {
    return (
      <p className="text-sm text-center py-4" style={{ color: 'var(--color-muted-foreground)' }}>
        {texts.booking.dataHorario.semHorarios}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          disabled={!slot.available}
          onClick={() => slot.available && onSelect(slot.time)}
          className={cn(
            'py-2 px-3 rounded-lg text-sm font-medium transition-colors',
            slot.available
              ? selectedTime === slot.time
                ? 'text-white'
                : 'border hover:opacity-80'
              : 'opacity-40 cursor-not-allowed border'
          )}
          style={
            slot.available && selectedTime === slot.time
              ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', borderColor: 'var(--color-primary)' }
              : slot.available
              ? { borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-background)' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-muted)' }
          }
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
