type BadgeTone = "blue" | "green" | "amber" | "red" | "slate" | "teal";

export function StatusBadge({ children, tone = "blue" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
