import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarPlus, CalendarCheck } from "lucide-react";
import { Header } from "./Header";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto px-4 py-6 text-foreground relative z-0">
        {children}
      </main>
      <nav className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center">
          <NavLink to="/agendamento" active={pathname.startsWith("/agendamento")} icon={<CalendarPlus className="h-5 w-5" />} label="Agendar" />
          <div className="w-px h-8 bg-border" />
          <NavLink to="/meus-agendamentos" active={pathname.startsWith("/meus-agendamentos")} icon={<CalendarCheck className="h-5 w-5" />} label="Agendamentos" />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
      {active && <div className="absolute bottom-0 h-0.5 w-12 rounded-full bg-primary" />}
    </Link>
  );
}
