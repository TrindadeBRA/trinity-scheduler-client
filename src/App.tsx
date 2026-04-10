import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { decodeShopId } from "./lib/api";
import { extractSlugFromSubdomain, resolveSlug, SlugNotFoundError } from "./services/slugResolver";
import { saveUnitInfo, hasCachedUnitInfo, SHOP_ID_KEY } from "./hooks/useShop";import { useMetaTags } from "./hooks/useMetaTags";
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
  const logout = useAuthStore((s) => s.logout);
  const currentClientId = useAuthStore((s) => s.clientId);

  // Extrai os parâmetros fora do useEffect para usá-los como dependências
  const clientIdParam = searchParams.get("clientId");
  const refParam = searchParams.get("ref");

  useEffect(() => {
    // Tenta fazer login automático via clientId (formato legado)
    if (clientIdParam) {
      // Se o clientId é diferente do atual, faz logout e recarrega a página
      if (currentClientId && currentClientId !== clientIdParam) {
        logout();
        window.location.reload();
        return;
      }
      loginFromUrl(clientIdParam);
      return;
    }
    
    // Tenta decodificar userId do ref parameter (novo formato)
    if (refParam) {
      // Verifica se já temos shopId (slug resolvido)
      const hasShopId = localStorage.getItem(SHOP_ID_KEY) !== null;
      
      if (hasShopId) {
        // Se temos shopId, o ref deve ser userId
        (async () => {
          try {
            const { decodeBase62 } = await import('./lib/encoding');
            const userId = decodeBase62(refParam);
            
            // Se o userId é diferente do atual, faz logout e recarrega a página
            if (currentClientId && currentClientId !== userId) {
              logout();
              localStorage.setItem('trinity_user_id', userId);
              window.location.reload();
              return;
            }
            
            localStorage.setItem('trinity_user_id', userId);
            
            // Faz login automático com o userId
            loginFromUrl(userId);
          } catch (error) {
            // ignore decode errors
          }
        })();
      }
    }
  }, [clientIdParam, refParam, loginFromUrl, logout, currentClientId]);

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
          // Se já temos dados em cache, usa imediatamente (evita flash de loading)
          if (hasCachedUnitInfo()) {
            setHasSlug(true);
            setIsResolving(false);
          }

          // Resolve slug para obter shopId e unitId (atualiza cache em background)
          const result = await resolveSlug(slug);
          saveUnitInfo(result);
          
          setUnitInfo({ shopName: result.shopName, unitName: result.unitName });
          setHasSlug(true);
        } else {
          // Sem slug, exibe home page
          setHasSlug(false);
        }

        setIsResolving(false);
      } catch (error) {
        // 404 = slug não existe — nunca usa cache, mostra 404
        if (error instanceof SlugNotFoundError) {
          setResolutionError('Unidade não encontrada');
          setIsResolving(false);
          return;
        }
        // Erro de rede — se temos cache, continua funcionando offline
        if (hasCachedUnitInfo()) {
          setHasSlug(true);
          setIsResolving(false);
          return;
        }
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
