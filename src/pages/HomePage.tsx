export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[600px] flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-display font-bold text-foreground">
          Home
        </h1>
        <p className="text-lg text-muted-foreground">
          Landing page da aplicação
        </p>
      </div>
    </div>
  );
}
