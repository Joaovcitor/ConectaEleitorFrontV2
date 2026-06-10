export function DetailField({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}
