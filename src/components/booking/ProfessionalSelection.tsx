import { useProfessionals } from '../../hooks/useProfessionals';
import { useBookingStore } from '../../stores/bookingStore';
import { SkeletonList } from '../ui/SkeletonList';
import { ProfessionalCard } from './ProfessionalCard';
import { Button } from '../ui/Button';
import texts from '../../config/texts.json';

export function ProfessionalSelection() {
  const { professionals, isLoading, isError } = useProfessionals();
  const { selectedProfessional, setProfessional, nextStep } = useBookingStore();
  const { titulo, subtitulo, semPreferencia, botaoContinuar } = texts.booking.profissional;

  if (isLoading) return <div className="p-4 flex flex-col gap-3"><SkeletonList count={3} itemClassName="h-20 rounded-lg" /></div>;
  if (isError) return <div className="p-4 text-center text-destructive">{texts.geral.erro}</div>;

  const hasSelection = selectedProfessional !== undefined;

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">{titulo}</h2>
        <p className="text-sm mt-1 text-muted-foreground">{subtitulo}</p>
      </div>
      <div className="flex flex-col gap-3">
        <ProfessionalCard professional={null} selected={selectedProfessional === null} onSelect={() => setProfessional(null)} isNoPreference noPreferenceLabel={semPreferencia} />
        {professionals.map((p) => (
          <ProfessionalCard key={p.id} professional={p} selected={selectedProfessional?.id === p.id} onSelect={() => setProfessional(p)} />
        ))}
      </div>
      {hasSelection && (
        <Button variant="primary" onClick={nextStep} className="mt-2">
          {botaoContinuar}
        </Button>
      )}
    </div>
  );
}
