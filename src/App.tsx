import { useEffect } from "react";
import { Routes, Route, Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { LoginPage } from "./pages/LoginPage";
import { BookingPage } from "./pages/BookingPage";
import { BookingSuccessPage } from "./pages/BookingSuccessPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { AppointmentDetailPage } from "./pages/AppointmentDetailPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const [searchParams] = useSearchParams();
  const loginFromUrl = useAuthStore((s) => s.loginFromUrl);

  useEffect(() => {
    const clientId = searchParams.get("clientId");
    if (clientId) {
      loginFromUrl(clientId);
    }
  }, [searchParams, loginFromUrl]);

  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/success"
        element={
          <ProtectedRoute>
            <BookingSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <AppointmentDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}

export default function App() {
  return <AppRoutes />;
}
