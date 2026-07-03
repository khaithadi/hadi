import { useState } from 'react';
import { Phone, Pencil, Plus, Trash2, Check, X, CalendarDays, Wallet } from 'lucide-react';
import { laborState, workerRates, workerUnpaid, dayHours } from '../lib/calc.js';
import { formatMoney, formatDate } from '../lib/format.js';
import ProgressBar from '../components/ProgressBar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useConfirm } from '../components/ConfirmProvider.jsx';
import { useT } from '../lib/i18n.js';

export default function WorkerDetail({ worker, data, nav, actions }) {
  const t = useT();
  const [confirmDel, setConfirmDel] = useState(false);
  const isMonthly = worker.payType === 'monthly';
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || t('c.general');

  return (
    <div className="page">
      <div className="profile-head">
        <div className="profile-id">
          <div className="profile-name">{worker.name}</div>
          <div style={{ margin: '4px 0 6px' }}>
            <StatusBadge label={t('wtype.' + worker.payType)} color={isMonthly ? 'var(--indigo)' : 'var(--copper)'} />
          </div>
          <div className="worker-meta">
            {worker.phone && <span>{t('c.phone')}: <b>{worker.phone}</b></span>}
            {worker.emergencyPhone && <span>{t('work.emergPhone')}: <b>{worker.emergencyPhone}</b>{worker.emergencyName ? ` (${worker.emergencyName})` : ''}</span>}
            {worker.idNumber && <span>{t('work.idNumber')}: <b>{worker.idNumber}</b></span>}
            {isMonthly && <span>{t('work.dailyLabel')} <b>{formatMoney(worker.dailySalary)}</b> · <b>{worker.dailyHours}</b> {t('work.perDay')}</span>}
            {worker.note && <span>{worker.note}</span>}
          </div>
        </div>
      </div>

      <div className="action-row">
        {worker.phone && (
          <a className="action-pill" href={`tel:${worker.phone.replace(/\s/g, '')}`}><Phone size={15} /> {t('cust.call')}</a>
        )}
        <button className="action-pill" onClick={() => nav.editWorker(worker)}><Pencil size={15} /> {t('c.edit')}</button>
      </div>

      {isMonthly ? <MonthlyBody worker={worker} data={data} nav={nav} actions={actions} /> : <ProjectBody worker={worker} data={data} nav={nav} actions={actions} nameOf={nameOf} />}

      {confirmDel ? (
        <div className="confirm-row">
          <span>{t('work.delConfirm')}</span>
          <button className="btn-danger-sm" onClick={() => { actions.deleteWorker(worker.id); nav.back(); }}><Check size={16} /></button>
          <button className="btn-ghost-sm" onClick={() => setConfirmDel(false)}><X size={16} /></button>
        </div>
      ) : (
        <button className="btn-text-danger" onClick={() => setConfirmDel(true)} style={{ marginTop: 8 }}>
          <Trash2 size={15} /> {t('work.delWorker')}
        </button>
      )}
    </div>
  );
}

/* ----------------------------- monthly ----------------------------- */
function MonthlyBody({ worker, data, nav, actions }) {
  const t = useT();
  const confirm = useConfirm();
  const rates = workerRates(worker);
  const unpaid = workerUnpaid(data.timesheet, worker.id, rates);
  const days = (data.timesheet || [])
    .filter((d) => d.workerId === worker.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <div className="profit-card">
        <div className="profit-top">
          <span className="profit-label">{t('work.unpaidDue')}</span>
          <span className="profit-value">{formatMoney(unpaid.amount)}</span>
        </div>
        <div className="profit-break">
          <div className="bk"><div className="bk-lbl">{t('work.unpaidHours')}</div><div className="bk-val">{unpaid.hours} h</div></div>
        </div>
      </div>

      <div className="doc-actions">
        <button className="btn-secondary sm" onClick={() => nav.newTimesheet(worker.id)}><Plus size={14} /> {t('work.logDay')}</button>
        <button className="btn-primary sm" onClick={() => nav.payPeriod(worker.id)} disabled={unpaid.amount <= 0}><Wallet size={14} /> {t('work.payPeriod')}</button>
      </div>

      <div className="section-title"><CalendarDays size={15} style={{ verticalAlign: 'middle' }} /> {t('work.dayLog')}</div>
      {days.length === 0 ? (
        <div className="muted">{t('work.noDays')}</div>
      ) : (
        <div className="ticket-list">
          {days.map((d) => {
            const h = dayHours(d);
            return (
              <div className="pay-item" key={d.id}>
                <div>
                  <div className="pa">{formatDate(d.date)} · {h.total} h</div>
                  <div className="pm">{d.start} → {d.end}{h.overtime > 0 ? ` · +${h.overtime}` : ''}</div>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {d.paid
                    ? <StatusBadge label={t('work.paidBadge')} color="var(--success)" />
                    : <button className="icon-btn-sm" onClick={async () => { if (await confirm(t('work.delDay'))) actions.deleteTimesheet(d.id); }} aria-label={t('c.delete')}><X size={15} /></button>}
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
  const t = useT();
  const confirm = useConfirm();
  const entries = (data.labor || [])
    .filter((l) => l.workerId === worker.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <div className="section-head">
        <div className="section-title">{t('work.dues')}</div>
        <button className="add-link" onClick={() => nav.newLabor(worker.id)}><Plus size={14} /> {t('work.addDue')}</button>
      </div>

      {entries.length === 0 ? (
        <div className="muted">{t('work.noDues')}</div>
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
                        <button className="icon-btn-sm" onClick={async () => { if (await confirm(t('work.delPayment'))) actions.deleteLaborPayment(l.id, p.id); }} aria-label={t('c.delete')}><X size={15} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="doc-actions" style={{ marginTop: 10 }}>
                  {st.remaining > 0 && (
                    <>
                      <button className="btn-primary sm" onClick={() => actions.payLaborInFull(l.id)}><Check size={14} /> {t('work.payFull')}</button>
                      <button className="btn-secondary sm" onClick={() => nav.laborPayment(l.id)}><Plus size={14} /> {t('inv.payment')}</button>
                    </>
                  )}
                  <button className="btn-text-danger" onClick={async () => { if (await confirm(t('work.delDue'))) actions.deleteLabor(l.id); }}><Trash2 size={14} /> {t('c.delete')}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
