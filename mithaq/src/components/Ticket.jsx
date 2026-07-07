// Signature "ticket" card (notched edges + dashed dividers). Wrapper only —
// views compose rows inside, exactly like the original MVP.
export default function Ticket({ onClick, children, style }) {
  return (
    <div className="ticket" onClick={onClick} style={style}>
      {children}
    </div>
  );
}

export function EmptyState({ text }) {
  return <div className="empty">{text}</div>;
}
