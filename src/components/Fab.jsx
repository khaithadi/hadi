import { Plus } from 'lucide-react';

export default function Fab({ onClick }) {
  return (
    <button className="fab" onClick={onClick} aria-label="إضافة">
      <Plus size={24} />
    </button>
  );
}
