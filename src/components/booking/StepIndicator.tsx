interface StepIndicatorProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
  stepLabels: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full px-2 py-3">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                style={{
                  backgroundColor: isCompleted || isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-muted)',
                  color: isCompleted || isActive
                    ? 'var(--color-primary-foreground)'
                    : 'var(--color-muted-foreground)',
                }}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className="text-[10px] font-medium text-center leading-tight max-w-[56px] truncate"
                style={{
                  color: isCompleted || isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-muted-foreground)',
                }}
              >
                {stepLabels[index]}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < totalSteps - 1 && (
              <div
                className="flex-1 h-px mx-1 transition-all duration-300"
                style={{
                  backgroundColor: index < currentStep
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
