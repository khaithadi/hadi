import { Compass, Heart, CalendarDays, User, LayoutDashboard, Home, Inbox } from 'lucide-react';

const GUEST_TABS = [
  { key: 'explore', label: 'استكشف', icon: Compass },
  { key: 'favorites', label: 'المفضّلة', icon: Heart },
  { key: 'bookings', label: 'حجوزاتي', icon: CalendarDays },
  { key: 'account', label: 'حسابي', icon: User },
];

const HOST_TABS = [
  { key: 'hostDashboard', label: 'لوحتي', icon: LayoutDashboard },
  { key: 'hostListings', label: 'عقاراتي', icon: Home },
  { key: 'hostBookings', label: 'الحجوزات', icon: Inbox },
  { key: 'account', label: 'حسابي', icon: User },
];

// Maps a sub-view to its owning tab so it stays highlighted.
function tabFor(view) {
  if (view === 'listingForm') return 'hostListings';
  return view;
}

export default function BottomNav({ role, active, onChange }) {
  const tabs = role === 'host' ? HOST_TABS : GUEST_TABS;
  const activeKey = tabFor(active);
  return (
    <div className="bottom-nav">
      {tabs.map((t) => {
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
