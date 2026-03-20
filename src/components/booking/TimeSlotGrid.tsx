import { cn } from '../../lib/utils';
import { SkeletonList } from '../ui/SkeletonList';
import type { TimeSlot } from '../../lib/types';
import texts from '../../config/texts.json';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  isLoading: boolean;
  isError?: boolean;
}

export function TimeSlotGrid({ slots, selectedTime, onSelect, isLoading, isError }: TimeSlotGridProps) {
  if (isLoading) return <div className="grid grid-cols-3 gap-2"><SkeletonList count={9} itemClassName="h-10 rounded-lg" /></div>;

  if (isError) return <p className="text-sm text-center py-4 text-destructive">{texts.geral.erro}</p>;

  const available = slots.filter((s) => s.available);
  if (available.length === 0) return <p className="text-sm text-center py-4 text-muted-foreground">{texts.booking.dataHorario.semHorarios}</p>;

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isSelected = slot.available && selectedTime === slot.time;
        return (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => slot.available && onSelect(slot.time)}
            className={cn(
              'py-2 px-3 rounded-lg text-sm font-medium transition-colors border',
              !slot.available && 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border',
              slot.available && !isSelected && 'bg-background text-foreground border-border hover:opacity-80',
              isSelected && 'bg-primary text-primary-foreground border-primary'
            )}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
