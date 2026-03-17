import { useServices } from "../../hooks/useServices";
import { useBookingStore } from "../../stores/bookingStore";
import { SkeletonList } from "../ui/SkeletonList";
import { ServiceCard } from "./ServiceCard";
import { Button } from "../ui/Button";
import { mockAddons } from "../../mocks/addons";
import { formatCurrency } from "../../lib/utils";
import { cn } from "../../lib/utils";
import texts from "../../config/texts.json";
import type { Service, AddonService } from "../../lib/types";
import { Check, Plus } from "lucide-react";

export function ServiceSelection() {
  const { services, isLoading, isError } = useServices();
  const selectedService = useBookingStore((s) => s.selectedService);
  const selectedAddons = useBookingStore((s) => s.selectedAddons);
  const setService = useBookingStore((s) => s.setService);
  const toggleAddon = useBookingStore((s) => s.toggleAddon);
  const nextStep = useBookingStore((s) => s.nextStep);

  function handleSelect(service: Service) {
    setService(service);
  }

  function handleContinue() {
    if (selectedService) nextStep();
  }

  const isAddonSelected = (addon: AddonService) =>
    selectedAddons.some((a) => a.id === addon.id);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-display font-bold text-foreground">{texts.booking.servico.titulo}</h2>
        <p className="text-sm mt-0.5 text-muted-foreground">{texts.booking.servico.subtitulo}</p>
      </div>
      {isLoading && (
        <div className="flex flex-col gap-3">
          <SkeletonList count={4} itemClassName="h-20 rounded-lg" />
        </div>
      )}
      {isError && <p className="text-sm text-destructive">{texts.geral.erro}</p>}
      {!isLoading && !isError && (
        <>
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} selected={selectedService?.id === service.id} onSelect={() => handleSelect(service)} />
            ))}
          </div>

          {selectedService && (
            <div className="flex flex-col gap-3 mt-2">
              <div>
                <h3 className="text-sm font-display font-semibold text-foreground">{texts.booking.adicionais.titulo}</h3>
                <p className="text-xs mt-0.5 text-muted-foreground">{texts.booking.adicionais.subtitulo}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mockAddons.map((addon) => {
                  const selected = isAddonSelected(addon);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={cn(
                        "flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-all",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/30"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground">{addon.name}</p>
                        <p className="text-xs text-muted-foreground">{addon.duration} min</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-primary">{formatCurrency(addon.price)}</span>
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center transition-colors",
                          selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        )}>
                          {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedService && (
            <Button variant="primary" onClick={handleContinue} className="mt-2">
              {texts.booking.adicionais.botaoContinuar}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
