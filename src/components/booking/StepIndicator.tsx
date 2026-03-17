import { useBookingStore } from '../../stores/bookingStore';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  const goToStep = useBookingStore((s) => s.goToStep);

  return (
    <div className="w-full px-4 py-4">
      <div className="relative flex items-start justify-between max-w-2xl mx-auto">
        {/* Connector lines behind circles */}
        <div
          className="absolute top-[13px] flex"
          style={{ left: `${100 / totalSteps / 2}%`, right: `${100 / totalSteps / 2}%` }}
          aria-hidden="true"
        >
          {Array.from({ length: totalSteps - 1 }).map((_, i) => (
            <div key={i} className="flex-1">
              <div
                className={`h-[2px] transition-all duration-300 ${
                  i < currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Steps */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={index}
              className="relative flex flex-col items-center z-10"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <button
                type="button"
                disabled={!isCompleted}
                onClick={() => isCompleted && goToStep(index)}
                aria-label={`${stepLabels[index]}${isCompleted ? ' — voltar para esta etapa' : ''}`}
                aria-current={isActive ? 'step' : undefined}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 ${
                  isActive
                    ? "border-primary text-primary bg-background"
                    : isCompleted
                      ? "border-primary bg-primary text-primary-foreground cursor-pointer hover:scale-110 hover:shadow-md"
                      : "border-border bg-muted text-muted-foreground cursor-default"
                }`}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span
                className={`text-xs mt-1.5 text-center leading-tight transition-all duration-300 ${
                  isActive
                    ? "font-bold text-primary"
                    : isCompleted
                      ? "font-medium text-primary"
                      : "font-medium text-muted-foreground"
                } ${isActive ? "" : "hidden sm:block"}`}
              >
                {stepLabels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
