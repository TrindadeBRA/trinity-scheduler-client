import texts from "../../config/texts.json";
import { Button } from "./Button";

interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function Dialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = texts.agendamentos.cancelar,
  cancelLabel = texts.geral.tentarNovamente,
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] p-6 shadow-xl">
        <h2
          id="dialog-title"
          className="mb-2 text-base font-semibold text-[var(--color-card-foreground)]"
        >
          {title}
        </h2>
        <p className="mb-6 text-sm text-[var(--color-muted-foreground)]">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
