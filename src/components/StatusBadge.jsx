// Generic colored badge — reuses the original `.badge` style, color via prop.
export default function StatusBadge({ label, color }) {
  return (
    <span className="badge" style={{ background: color }}>
      {label}
    </span>
  );
}
