import { useServices } from "../../hooks/useServices";
import { useBookingStore } from "../../stores/bookingStore";
import { SkeletonList } from "../ui/SkeletonList";
import { ServiceCard } from "./ServiceCard";
import texts from "../../config/texts.json";
import type { Service } from "../../lib/types";

export function ServiceSelection() {
  const { services, isLoading, isError } = useServices();
  const selectedService = useBookingStore((s) => s.selectedService);
  const setService = useBookingStore((s) => s.setService);
  const nextStep = useBookingStore((s) => s.nextStep);

  function handleSelect(service: Service) {
    setService(service);
    nextStep();
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--color-foreground)" }}
        >
          {texts.booking.servico.titulo}
        </h2>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {texts.booking.servico.subtitulo}
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <SkeletonList count={4} itemClassName="h-20 rounded-lg" />
        </div>
      )}

      {isError && (
        <p className="text-sm" style={{ color: "var(--color-destructive)" }}>
          {texts.geral.erro}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={selectedService?.id === service.id}
              onSelect={() => handleSelect(service)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
