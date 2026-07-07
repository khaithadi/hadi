import { LayoutDashboard, Users, ClipboardList, ReceiptText, Wallet } from 'lucide-react';
import { useT } from '../lib/i18n.js';

const TABS = [
  { key: 'dashboard', tkey: 'nav.dashboard', icon: LayoutDashboard },
  { key: 'customers', tkey: 'nav.customers', icon: Users },
  { key: 'quotes', tkey: 'nav.quotes', icon: ClipboardList },
  { key: 'invoices', tkey: 'nav.invoices', icon: ReceiptText },
  { key: 'expenses', tkey: 'nav.expenses', icon: Wallet },
];

// Maps any sub-view to its owning tab (e.g. customer profile → customers).
function tabFor(view) {
  if (view.startsWith('customer')) return 'customers';
  if (view.startsWith('quote')) return 'quotes';
  if (view.startsWith('invoice')) return 'invoices';
  if (view.startsWith('expense') || view.startsWith('worker') || view.startsWith('labor')) return 'expenses';
  return view;
}

export default function BottomNav({ active, onChange }) {
  const t = useT();
  const activeKey = tabFor(active);
  return (
    <div className="bottom-nav">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            className={'nav-item' + (isActive ? ' active' : '')}
            onClick={() => onChange(tab.key)}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span>{t(tab.tkey)}</span>
          </button>
        );
      })}
    </div>
  );
}
