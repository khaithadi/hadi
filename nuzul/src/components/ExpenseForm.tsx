'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

type PropertyOption = { id: string; title: string };

export default function ExpenseForm({
  properties,
  defaultPropertyId,
  lockProperty,
}: {
  properties: PropertyOption[];
  defaultPropertyId?: string;
  lockProperty?: boolean;
}) {
  const t = useTranslations('host');
  const tc = useTranslations('expenseCat');
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(defaultPropertyId ?? '');
  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORIES)[number]>('maintenance');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/host/expenses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ propertyId: propertyId || undefined, category, amount, date, note: note || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.error?.message || 'Error');
        return;
      }
      setAmount('');
      setNote('');
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary btn-block mt-3">
        ＋ {t('addExpense')}
      </button>
    );
  }

  return (
    <div className="pop-in card mt-3 p-4">
      <div className="grid grid-cols-2 gap-3">
        {!lockProperty && (
          <div className="col-span-2">
            <label className="label">{t('expenseProperty')}</label>
            <select className="input" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
              <option value="">{t('generalExpense')}</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label">{t('expenseCategory')}</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{tc(c)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('expenseAmount')}</label>
          <input type="number" min={1} inputMode="numeric" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label">{t('expenseDate')}</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">{t('expenseNote')}</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
        </div>
      </div>

      {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

      <div className="mt-4 flex gap-2.5">
        <button className="btn-primary flex-1" disabled={busy || !amount} onClick={submit}>{t('add')}</button>
        <button className="btn-ghost flex-1" disabled={busy} onClick={() => setOpen(false)}>{t('hide')}</button>
      </div>
    </div>
  );
}
