export function LoadingState({ label = "Carregando informações..." }: { label?: string }) {
  return (
    <div className="loading-card">
      <div className="loader" />
      <strong>{label}</strong>
      <span>Isso leva apenas alguns instantes.</span>
    </div>
  );
}
