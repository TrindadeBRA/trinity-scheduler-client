export function SlugNotFoundError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[360px] flex flex-col items-center gap-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-muted-foreground"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Unidade não encontrada
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O link que você acessou não corresponde a nenhuma unidade cadastrada.
            Verifique se o endereço está correto e tente novamente.
          </p>
        </div>
      </div>
    </div>
  );
}
