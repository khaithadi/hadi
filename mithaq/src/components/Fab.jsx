import { Plus } from 'lucide-react';
import { useT } from '../lib/i18n.js';

export default function Fab({ onClick }) {
  const t = useT();
  return (
    <button className="fab" onClick={onClick} aria-label={t('c.add')}>
      <Plus size={24} />
    </button>
  );
}
