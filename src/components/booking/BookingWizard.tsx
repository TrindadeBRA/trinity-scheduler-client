import { useEffect } from 'react';
import { useBookingStore } from '../../stores/bookingStore';
import { StepIndicator } from './StepIndicator';
import { ServiceSelection } from './ServiceSelection';
import { ProfessionalSelection } from './ProfessionalSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { BookingConfirmation } from './BookingConfirmation';
import texts from '../../config/texts.json';

const STEP_COMPONENTS = [ServiceSelection, ProfessionalSelection, DateTimeSelection, BookingConfirmation];

export function BookingWizard() {
  const currentStep = useBookingStore((s) => s.currentStep);
  const stepLabels: string[] = texts.booking.etapas;
  const StepComponent = STEP_COMPONENTS[currentStep] ?? STEP_COMPONENTS[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  return (
    <div className="flex flex-col w-full bg-background">
      <StepIndicator currentStep={currentStep} totalSteps={STEP_COMPONENTS.length} stepLabels={stepLabels} />
      <div key={currentStep} className="flex-1 animate-[stepFadeIn_0.25s_ease-out]">
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
