'use client';

import { useTranslations } from 'next-intl';

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const tc = useTranslations('common');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center" onClick={onCancel}>
      <div className="pop-in card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-extrabold">{title}</h2>
        {body && <p className="mt-1.5 text-sm text-ink/60">{body}</p>}
        <div className="mt-5 flex gap-2.5">
          <button
            disabled={busy}
            onClick={onConfirm}
            className={`btn flex-1 text-white ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-ink hover:bg-ink/90'}`}
          >
            {confirmLabel}
          </button>
          <button disabled={busy} onClick={onCancel} className="btn-ghost flex-1">{tc('cancel')}</button>
        </div>
      </div>
    </div>
  );
}
