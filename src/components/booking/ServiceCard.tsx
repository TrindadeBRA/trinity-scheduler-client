import {
  Scissors,
  User,
  Star,
  Zap,
  Droplets,
  Clock,
  Sparkles,
  Heart,
  Smile,
  type LucideIcon,
} from "lucide-react";
import { Card } from "../ui/Card";
import { formatCurrency } from "../../lib/utils";
import type { Service } from "../../lib/types";

const ICON_MAP: Record<string, LucideIcon> = {
  scissors: Scissors,
  user: User,
  star: Star,
  zap: Zap,
  droplets: Droplets,
  clock: Clock,
  sparkles: Sparkles,
  heart: Heart,
  smile: Smile,
};

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  const IconComponent = service.icon ? (ICON_MAP[service.icon] ?? Clock) : Clock;

  return (
    <Card variant="selectable" selected={selected} onClick={onSelect}>
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          <IconComponent size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-semibold text-sm truncate"
              style={{ color: "var(--color-card-foreground)" }}
            >
              {service.name}
            </h3>
            <span
              className="font-bold text-sm flex-shrink-0"
              style={{ color: "var(--color-primary)" }}
            >
              {formatCurrency(service.price)}
            </span>
          </div>

          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {service.duration} min
          </p>

          {service.description && (
            <p
              className="text-xs mt-1 line-clamp-2"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {service.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
