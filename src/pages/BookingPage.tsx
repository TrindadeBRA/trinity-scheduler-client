import { useEffect } from "react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { BookingWizard } from "../components/booking/BookingWizard";
import { ClientNameGate } from "../components/booking/ClientNameGate";
import { useBookingStore } from "../stores/bookingStore";

export function BookingPage() {
  const reset = useBookingStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <ClientNameGate>
      <MobileLayout>
        <BookingWizard />
      </MobileLayout>
    </ClientNameGate>
  );
}
