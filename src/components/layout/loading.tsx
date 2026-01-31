export function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-text">
      <div className="h-14 w-14 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />
      <p className="text-sm tracking-[0.3em] text-text-muted">LOADING</p>
    </div>
  );
}
