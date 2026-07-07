import { Home, CalendarCheck, Clock, Plus, Inbox, Receipt } from 'lucide-react';
import { hostMetrics } from '../lib/calc.js';
import { formatMoney } from '../lib/format.js';

export default function HostDashboard({ data, nav }) {
  const m = hostMetrics(data, data.settings.userId);

  return (
    <div className="page">
      <div className="net-card" style={{ borderColor: 'var(--ink)' }}>
        <div className="label">صافي الربح (الدخل − المصاريف)</div>
        <div className="net-value">{formatMoney(m.net)}</div>
      </div>

      <div className="count-row">
        <div className="count-tile"><Home size={20} /><span className="count-n">{m.listingsCount}</span><span className="count-lbl">عقاراتي</span></div>
        <div className="count-tile"><CalendarCheck size={20} /><span className="count-n">{m.bookingsCount}</span><span className="count-lbl">الحجوزات</span></div>
        <div className="count-tile"><Clock size={20} /><span className="count-n">{m.pending}</span><span className="count-lbl">معلّقة</span></div>
      </div>

      <div className="count-row">
        <div className="count-tile"><span className="count-n" style={{ color: 'var(--accent)' }}>{formatMoney(m.earnings)}</span><span className="count-lbl">إجمالي الدخل</span></div>
        <div className="count-tile"><span className="count-n" style={{ color: 'var(--danger)' }}>{formatMoney(m.expenses)}</span><span className="count-lbl">إجمالي المصاريف</span></div>
      </div>

      <button className="btn-primary" onClick={() => nav.newListing()}><Plus size={17} /> أضف عقاراً جديداً</button>
      <button className="btn-secondary" onClick={() => nav.go('hostBookings')}><Inbox size={16} /> إدارة الحجوزات الواردة</button>
      <button className="btn-secondary" onClick={() => nav.go('hostExpenses')}><Receipt size={16} /> تتبّع المصاريف</button>
    </div>
  );
}
