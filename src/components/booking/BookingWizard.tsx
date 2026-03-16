import { useBookingStore } from '../../stores/bookingStore';
import { StepIndicator } from './StepIndicator';
import { ServiceSelection } from './ServiceSelection';
import { ProfessionalSelection } from './ProfessionalSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { BookingConfirmation } from './BookingConfirmation';
import texts from '../../config/texts.json';

const STEP_COMPONENTS = [
  ServiceSelection,
  ProfessionalSelection,
  DateTimeSelection,
  BookingConfirmation,
];

export function BookingWizard() {
  const currentStep = useBookingStore((s) => s.currentStep);
  const stepLabels: string[] = texts.booking.etapas;
  const totalSteps = STEP_COMPONENTS.length;

  const StepComponent = STEP_COMPONENTS[currentStep] ?? STEP_COMPONENTS[0];

  return (
    <div
      className="flex flex-col w-full"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <StepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
      />

      <div
        key={currentStep}
        className="flex-1"
        style={{
          animation: 'stepFadeIn 0.25s ease-out',
        }}
      >
        <StepComponent />
      </div>

      <style>{`
        @keyframes stepFadeIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
