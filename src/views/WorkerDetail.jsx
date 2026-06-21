import { useState } from 'react';
import { Phone, Pencil, Plus, Trash2, Check, X, CalendarDays, Wallet } from 'lucide-react';
import { WORKER_TYPES, meta } from '../lib/constants.js';
import { laborState, workerRates, workerUnpaid, dayHours } from '../lib/calc.js';
import { formatMoney, formatDate } from '../lib/format.js';
import ProgressBar from '../components/ProgressBar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function WorkerDetail({ worker, data, nav, actions }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const tm = meta(WORKER_TYPES, worker.payType);
  const isMonthly = worker.payType === 'monthly';
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || 'عام';

  return (
    <div className="page">
      <div className="profile-head">
        <div className="profile-id">
          <div className="profile-name">{worker.name}</div>
          <div style={{ margin: '4px 0 6px' }}>
            <StatusBadge label={tm.label} color={isMonthly ? 'var(--indigo)' : 'var(--copper)'} />
          </div>
          <div className="worker-meta">
            {worker.phone && <span>الهاتف: <b>{worker.phone}</b></span>}
            {worker.emergencyPhone && <span>احتياطي: <b>{worker.emergencyPhone}</b>{worker.emergencyName ? ` (${worker.emergencyName})` : ''}</span>}
            {worker.idNumber && <span>بطاقة التعريف: <b>{worker.idNumber}</b></span>}
            {isMonthly && <span>الراتب اليومي: <b>{formatMoney(worker.dailySalary)}</b> · <b>{worker.dailyHours}</b> سا/يوم</span>}
            {worker.note && <span>{worker.note}</span>}
          </div>
        </div>
      </div>

      <div className="action-row">
        {worker.phone && (
          <a className="action-pill" href={`tel:${worker.phone.replace(/\s/g, '')}`}><Phone size={15} /> اتصال</a>
        )}
        <button className="action-pill" onClick={() => nav.editWorker(worker)}><Pencil size={15} /> تعديل</button>
      </div>

      {isMonthly ? <MonthlyBody worker={worker} data={data} nav={nav} actions={actions} /> : <ProjectBody worker={worker} data={data} nav={nav} actions={actions} nameOf={nameOf} />}

      {confirmDel ? (
        <div className="confirm-row">
          <span>حذف العامل وكل سجلّاته؟</span>
          <button className="btn-danger-sm" onClick={() => { actions.deleteWorker(worker.id); nav.back(); }}><Check size={16} /></button>
          <button className="btn-ghost-sm" onClick={() => setConfirmDel(false)}><X size={16} /></button>
        </div>
      ) : (
        <button className="btn-text-danger" onClick={() => setConfirmDel(true)} style={{ marginTop: 8 }}>
          <Trash2 size={15} /> حذف العامل
        </button>
      )}
    </div>
  );
}

/* ----------------------------- monthly ----------------------------- */
function MonthlyBody({ worker, data, nav, actions }) {
  const rates = workerRates(worker);
  const unpaid = workerUnpaid(data.timesheet, worker.id, rates);
  const days = (data.timesheet || [])
    .filter((d) => d.workerId === worker.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <div className="profit-card">
        <div className="profit-top">
          <span className="profit-label">مستحق غير مدفوع</span>
          <span className="profit-value">{formatMoney(unpaid.amount)}</span>
        </div>
        <div className="profit-break">
          <div className="bk"><div className="bk-lbl">ساعات غير مدفوعة</div><div className="bk-val">{unpaid.hours} سا</div></div>
        </div>
      </div>

      <div className="doc-actions">
        <button className="btn-secondary sm" onClick={() => nav.newTimesheet(worker.id)}><Plus size={14} /> تسجيل يوم</button>
        <button className="btn-primary sm" onClick={() => nav.payPeriod(worker.id)} disabled={unpaid.amount <= 0}><Wallet size={14} /> دفع فترة</button>
      </div>

      <div className="section-title"><CalendarDays size={15} style={{ verticalAlign: 'middle' }} /> سجل الأيام</div>
      {days.length === 0 ? (
        <div className="muted">لا توجد أيام مسجّلة بعد</div>
      ) : (
        <div className="ticket-list">
          {days.map((d) => {
            const h = dayHours(d);
            return (
              <div className="pay-item" key={d.id}>
                <div>
                  <div className="pa">{formatDate(d.date)} · {h.total} سا</div>
                  <div className="pm">{d.start} → {d.end}{h.overtime > 0 ? ` · +${h.overtime} إضافي` : ''}</div>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {d.paid
                    ? <StatusBadge label="مدفوعة" color="var(--success)" />
                    : <button className="icon-btn-sm" onClick={() => actions.deleteTimesheet(d.id)} aria-label="حذف"><X size={15} /></button>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ----------------------------- project ----------------------------- */
function ProjectBody({ worker, data, nav, actions, nameOf }) {
  const entries = (data.labor || [])
    .filter((l) => l.workerId === worker.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <div className="section-head">
        <div className="section-title">المستحقات</div>
        <button className="add-link" onClick={() => nav.newLabor(worker.id)}><Plus size={14} /> إضافة مستحق</button>
      </div>

      {entries.length === 0 ? (
        <div className="muted">لا توجد مستحقات بعد</div>
      ) : (
        <div className="ticket-list">
          {entries.map((l) => {
            const st = laborState(l);
            const lines = l.basis === 'measured' && Array.isArray(l.items) && l.items.length ? l.items : null;
            return (
              <div className="doc-card" key={l.id}>
                <div className="doc-card-head">
                  <div>
                    <div className="doc-client">{nameOf(l.customerId)}</div>
                    <div className="doc-sub">{formatDate(l.date)}{l.note ? ' · ' + l.note : ''}</div>
                  </div>
                  <span className="ticket-amount" style={{ color: 'var(--copper-dark)' }}>{formatMoney(st.due)}</span>
                </div>

                {lines && (
                  <div style={{ marginTop: 6 }}>
                    {lines.map((it) => (
                      <div className="item-row subtle" key={it.id}>
                        <span>{it.desc || '—'} · {it.quantity} {it.unit} × {formatMoney(it.price)}</span>
                        <span>{formatMoney((Number(it.quantity) || 0) * (Number(it.price) || 0))}</span>
                      </div>
                    ))}
                  </div>
                )}

                <ProgressBar state={st} />

                {(l.payments || []).length > 0 && (
                  <div className="ticket-list" style={{ marginTop: 10 }}>
                    {l.payments.map((p) => (
                      <div className="pay-item" key={p.id}>
                        <div><div className="pa">{formatMoney(p.amount)}</div><div className="pm">{formatDate(p.date)}</div></div>
                        <button className="icon-btn-sm" onClick={() => actions.deleteLaborPayment(l.id, p.id)} aria-label="حذف"><X size={15} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="doc-actions" style={{ marginTop: 10 }}>
                  {st.remaining > 0 && (
                    <>
                      <button className="btn-primary sm" onClick={() => actions.payLaborInFull(l.id)}><Check size={14} /> مدفوع بالكامل</button>
                      <button className="btn-secondary sm" onClick={() => nav.laborPayment(l.id)}><Plus size={14} /> دفعة</button>
                    </>
                  )}
                  <button className="btn-text-danger" onClick={() => actions.deleteLabor(l.id)}><Trash2 size={14} /> حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
