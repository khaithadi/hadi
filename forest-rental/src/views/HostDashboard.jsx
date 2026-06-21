import { Home, CalendarCheck, Clock, Plus, Inbox } from 'lucide-react';
import { hostMetrics } from '../lib/calc.js';
import { formatMoney } from '../lib/format.js';

export default function HostDashboard({ data, nav }) {
  const m = hostMetrics(data, data.settings.userId);

  return (
    <div className="page">
      <div className="net-card" style={{ borderColor: 'var(--forest)' }}>
        <div className="label">إجمالي الأرباح (المؤكّدة)</div>
        <div className="net-value" style={{ color: 'var(--forest-dark)' }}>{formatMoney(m.earnings)}</div>
      </div>

      <div className="count-row">
        <div className="count-tile">
          <Home size={20} /><span className="count-n">{m.listingsCount}</span><span className="count-lbl">عقاراتي</span>
        </div>
        <div className="count-tile">
          <CalendarCheck size={20} /><span className="count-n">{m.bookingsCount}</span><span className="count-lbl">الحجوزات</span>
        </div>
        <div className="count-tile">
          <Clock size={20} /><span className="count-n">{m.pending}</span><span className="count-lbl">معلّقة</span>
        </div>
      </div>

      <button className="btn-primary" onClick={() => nav.newListing()}>
        <Plus size={17} /> أضف عقاراً جديداً
      </button>
      <button className="btn-secondary" onClick={() => nav.go('hostBookings')}>
        <Inbox size={16} /> إدارة الحجوزات الواردة
      </button>
    </div>
  );
}
