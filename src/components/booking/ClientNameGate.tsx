import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { updateClientName } from "../../services/authService";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface ClientNameGateProps {
  children: React.ReactNode;
}

export function ClientNameGate({ children }: ClientNameGateProps) {
  const clientId = useAuthStore((s) => s.clientId);
  const clientName = useAuthStore((s) => s.clientName);
  const setClientName = useAuthStore((s) => s.setClientName);

  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (clientName) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Informe seu nome completo");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateClientName(clientId!, trimmed);
      setClientName(trimmed);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Quase lá</h1>
          <p className="text-sm text-muted-foreground">Informe seu nome para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="client-name"
            type="text"
            placeholder="Seu nome completo"
            value={nameInput}
            onChange={(e) => { setNameInput(e.target.value); setError(null); }}
            error={error ?? undefined}
            disabled={saving}
          />
          <Button type="submit" variant="primary" loading={saving} disabled={!nameInput.trim() || saving} className="w-full">
            Continuar
          </Button>
        </form>
      </div>
    </div>
  );
}
