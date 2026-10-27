export function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-accent" />
      <span className="sr-only">Cargando</span>
    </div>
  );
}
