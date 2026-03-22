import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { decodeShopId } from "./lib/api";
import { extractSlugFromSubdomain, resolveSlug } from "./services/slugResolver";
import { useMetaTags } from "./hooks/useMetaTags";
import { SkinProvider } from "./contexts/SkinContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { BookingPage } from "./pages/BookingPage";
import { BookingSuccessPage } from "./pages/BookingSuccessPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { AppointmentDetailPage } from "./pages/AppointmentDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SlugNotFoundError } from "./components/SlugNotFoundError";

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
    // Tenta fazer login automático via clientId (formato legado)
    const clientId = searchParams.get("clientId");
    if (clientId) {
      loginFromUrl(clientId);
      return;
    }
    
    // Tenta decodificar userId do ref parameter (novo formato)
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      // Verifica se já temos shopId (slug resolvido)
      const hasShopId = localStorage.getItem('trinity_shop_id') !== null;
      
      if (hasShopId) {
        // Se temos shopId, o ref deve ser userId
        (async () => {
          try {
            const { decodeBase62 } = await import('./lib/encoding');
            const userId = decodeBase62(ref);
            localStorage.setItem('trinity_user_id', userId);
            
            // Faz login automático com o userId
            loginFromUrl(userId);
          } catch (error) {
            console.error('[App] Erro ao decodificar ref:', error);
          }
        })();
      }
    }
  }, [searchParams, loginFromUrl]);

  const shopId = decodeShopId();

  if (!shopId) {
    return <NotFoundPage />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/agendamento"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agendamento/sucesso"
        element={
          <ProtectedRoute>
            <BookingSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meus-agendamentos"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meus-agendamentos/:id"
        element={
          <ProtectedRoute>
            <AppointmentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
}

export default function App() {
  const [isResolving, setIsResolving] = useState(true);
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [hasSlug, setHasSlug] = useState(false);
  const [unitInfo, setUnitInfo] = useState<{ shopName: string; unitName: string } | null>(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Tenta extrair slug do subdomínio
        const slug = extractSlugFromSubdomain();

        if (slug) {
          // Resolve slug para obter shopId e unitId
          const result = await resolveSlug(slug);

          // Armazena em localStorage
          localStorage.setItem('trinity_shop_id', result.shopId);
          localStorage.setItem('trinity_unit_id', result.unitId);

          console.log(`[Slug] Resolvido: ${slug} -> Shop: ${result.shopName}, Unit: ${result.unitName}`);
          
          // Armazena info para meta tags
          setUnitInfo({ shopName: result.shopName, unitName: result.unitName });
          setHasSlug(true);
        } else {
          // Sem slug, exibe home page
          setHasSlug(false);
        }

        setIsResolving(false);
      } catch (error) {
        console.error('[Slug] Erro ao resolver:', error);
        setResolutionError(error instanceof Error ? error.message : 'Erro ao resolver slug');
        setIsResolving(false);
      }
    }

    initializeApp();
  }, []);

  // Atualiza meta tags dinamicamente baseado na unidade
  useMetaTags({
    title: unitInfo 
      ? `${unitInfo.unitName} | Agende seu Horário`
      : 'Kronuz - Agende seu Horário',
    description: unitInfo
      ? `Agende seu horário em ${unitInfo.unitName} de forma rápida e fácil`
      : 'Agende seu horário de forma rápida e fácil',
    url: window.location.href,
  });

  // Exibe loading durante resolução
  if (isResolving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Exibe erro se resolução falhar
  if (resolutionError) {
    return <SlugNotFoundError />;
  }

  // Se não tem slug, exibe home page
  if (!hasSlug) {
    return <HomePage />;
  }

  return (
    <SkinProvider>
      <AppRoutes />
    </SkinProvider>
  );
}
