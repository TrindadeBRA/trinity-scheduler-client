import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header } from "./Header";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div
      className="flex flex-col min-h-screen w-full max-w-screen-xl mx-auto"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <Header />

      <main
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ color: "var(--color-foreground)" }}
      >
        {children}
      </main>

      <nav
        className="sticky bottom-0 flex border-t"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <NavLink to="/booking" active={pathname.startsWith("/booking")}>
          Agendar
        </NavLink>
        <NavLink to="/appointments" active={pathname.startsWith("/appointments")}>
          Agendamentos
        </NavLink>
      </nav>
    </div>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors"
      style={{
        color: active ? "var(--color-primary)" : "var(--color-muted-foreground)",
      }}
    >
      {children}
    </Link>
  );
}
