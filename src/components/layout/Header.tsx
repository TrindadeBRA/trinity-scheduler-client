import { useAuthStore } from "../../stores/authStore";
import niche from "../../config/niche.json";
import texts from "../../config/texts.json";

export function Header() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <header
      style={{
        backgroundColor: "var(--color-card)",
        borderBottom: "1px solid var(--color-border)",
        color: "var(--color-foreground)",
      }}
      className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
    >
      <div className="flex items-center gap-2">
        <img
          src={niche.logo}
          alt={niche.businessName}
          className="h-8 w-8 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <span
          className="font-semibold text-base"
          style={{ color: "var(--color-primary)" }}
        >
          {niche.businessName}
        </span>
      </div>

      <button
        onClick={logout}
        className="text-sm px-3 py-1 rounded-md transition-opacity hover:opacity-80"
        style={{
          color: "var(--color-muted-foreground)",
          backgroundColor: "var(--color-muted)",
        }}
        type="button"
      >
        {texts.geral.sair}
      </button>
    </header>
  );
}
