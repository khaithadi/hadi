import { LayoutDashboard, Users, ClipboardList, ReceiptText, Wallet } from 'lucide-react';

const TABS = [
  { key: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { key: 'customers', label: 'العملاء', icon: Users },
  { key: 'quotes', label: 'العروض', icon: ClipboardList },
  { key: 'invoices', label: 'الفواتير', icon: ReceiptText },
  { key: 'expenses', label: 'المصاريف', icon: Wallet },
];

// Maps any sub-view to its owning tab (e.g. customer profile → customers).
function tabFor(view) {
  if (view.startsWith('customer')) return 'customers';
  if (view.startsWith('quote')) return 'quotes';
  if (view.startsWith('invoice')) return 'invoices';
  if (view.startsWith('expense')) return 'expenses';
  return view;
}

export default function BottomNav({ active, onChange }) {
  const activeKey = tabFor(active);
  return (
    <div className="bottom-nav">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = activeKey === t.key;
        return (
          <button
            key={t.key}
            className={'nav-item' + (isActive ? ' active' : '')}
            onClick={() => onChange(t.key)}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
