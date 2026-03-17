import { Clock } from "lucide-react";
import { Card } from "../ui/Card";
import { formatCurrency } from "../../lib/utils";
import type { Service } from "../../lib/types";

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <Card variant="selectable" selected={selected} onClick={onSelect} className="p-0 overflow-hidden">
      <div className="flex">
        {service.image && (
          <img
            src={service.image}
            alt={service.name}
            className="w-24 h-24 sm:w-28 sm:h-28 object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate text-card-foreground">{service.name}</h3>
              <span className="font-bold text-sm flex-shrink-0 text-primary">{formatCurrency(service.price)}</span>
            </div>
            {service.description && (
              <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">{service.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{service.duration} min</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
