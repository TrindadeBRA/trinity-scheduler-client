import { UserCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Professional } from '../../lib/types';

interface ProfessionalCardProps {
  professional: Professional | null;
  selected: boolean;
  onSelect: () => void;
  isNoPreference?: boolean;
  noPreferenceLabel?: string;
}

export function ProfessionalCard({
  professional, selected, onSelect,
  isNoPreference = false, noPreferenceLabel = 'Sem preferência',
}: ProfessionalCardProps) {
  return (
    <Card variant="selectable" selected={selected} onClick={onSelect}>
      <div className="flex items-center gap-3">
        {isNoPreference || !professional?.avatar ? (
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
            <UserCircle size={28} className="text-muted-foreground" />
          </div>
        ) : (
          <img src={professional.avatar} alt={professional.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-medium text-sm text-foreground">
            {isNoPreference ? noPreferenceLabel : professional?.name}
          </span>
          {!isNoPreference && professional?.specialties && professional.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {professional.specialties.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
