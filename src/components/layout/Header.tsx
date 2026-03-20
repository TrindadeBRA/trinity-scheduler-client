import { useAuthStore } from "../../stores/authStore";
import { useShopName } from "../../hooks/useShop";
import niche from "../../config/niche.json";
import texts from "../../config/texts.json";

export function Header() {
  const logout = useAuthStore((s) => s.logout);
  const shopName = useShopName();

  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-card border-b border-border">
      <div className="flex items-center gap-2">
        <img
          src={niche.logo}
          alt={shopName}
          className="h-8 w-8 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="font-display font-semibold text-base text-primary">
          {shopName}
        </span>
      </div>

      <button
        onClick={logout}
        className="text-sm px-3 py-1 rounded-md transition-opacity hover:opacity-80 text-muted-foreground bg-muted"
        type="button"
      >
        {texts.geral.sair}
      </button>
    </header>
  );
}
