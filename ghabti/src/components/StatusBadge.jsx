// Generic colored badge — color passed via prop.
export default function StatusBadge({ label, color }) {
  return (
    <span className="badge" style={{ background: color }}>
      {label}
    </span>
  );
}
