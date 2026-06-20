import { useState } from 'react';
import { Phone, Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import { WORKER_TYPES, meta } from '../lib/constants.js';
import { laborState } from '../lib/calc.js';
import { formatMoney, formatDate } from '../lib/format.js';
import ProgressBar from '../components/ProgressBar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function WorkerDetail({ worker, data, nav, actions }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const tm = meta(WORKER_TYPES, worker.payType);
  const entries = (data.labor || [])
    .filter((l) => l.workerId === worker.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || 'عام';

  return (
    <div className="page">
      <div className="profile-head">
        <div className="profile-id">
          <div className="profile-name">{worker.name}</div>
          <div style={{ margin: '4px 0 6px' }}>
            <StatusBadge label={tm.label} color={worker.payType === 'monthly' ? 'var(--indigo)' : 'var(--copper)'} />
          </div>
          <div className="worker-meta">
            {worker.phone && <span>الهاتف: <b>{worker.phone}</b></span>}
            {worker.emergencyPhone && <span>احتياطي: <b>{worker.emergencyPhone}</b>{worker.emergencyName ? ` (${worker.emergencyName})` : ''}</span>}
            {worker.idNumber && <span>بطاقة التعريف: <b>{worker.idNumber}</b></span>}
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
            const unitInfo = l.basis === 'measured' ? `${l.quantity} ${l.unit} × ${formatMoney(l.unitPrice)}` : 'مبلغ ثابت';
            return (
              <div className="doc-card" key={l.id}>
                <div className="doc-card-head">
                  <div>
                    <div className="doc-client">{nameOf(l.customerId)}</div>
                    <div className="doc-sub">{unitInfo} · {formatDate(l.date)}</div>
                  </div>
                  <span className="ticket-amount" style={{ color: 'var(--copper-dark)' }}>{formatMoney(st.due)}</span>
                </div>
                {l.note ? <div className="doc-notes">{l.note}</div> : null}
                <ProgressBar state={st} />

                {(l.payments || []).length > 0 && (
                  <div className="ticket-list" style={{ marginTop: 10 }}>
                    {l.payments.map((p) => (
                      <div className="pay-item" key={p.id}>
                        <div>
                          <div className="pa">{formatMoney(p.amount)}</div>
                          <div className="pm">{formatDate(p.date)}</div>
                        </div>
                        <button className="icon-btn-sm" onClick={() => actions.deleteLaborPayment(l.id, p.id)} aria-label="حذف"><X size={15} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="doc-actions" style={{ marginTop: 10 }}>
                  {st.remaining > 0 && (
                    <button className="btn-secondary sm" onClick={() => nav.laborPayment(l.id)}><Plus size={14} /> دفعة</button>
                  )}
                  <button className="btn-text-danger" onClick={() => actions.deleteLabor(l.id)}><Trash2 size={14} /> حذف المستحق</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDel ? (
        <div className="confirm-row">
          <span>حذف العامل وكل مستحقاته؟</span>
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
