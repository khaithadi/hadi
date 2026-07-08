export default function PriceRow({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={`flex justify-between ${strong ? 'font-bold' : ''} ${accent ? 'text-brand-700' : 'text-ink/70'}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
