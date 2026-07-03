import { createContext, useContext, useCallback, useState } from 'react';
import { useT } from '../lib/i18n.js';

// A single app-wide confirmation modal. Any component calls
//   const confirm = useConfirm();
//   if (await confirm('حذف الدفعة؟')) actions.delete(...);
// so every destructive action gets a clear, consistent confirm step.
const ConfirmCtx = createContext(() => Promise.resolve(true));

export function useConfirm() {
  return useContext(ConfirmCtx);
}

export default function ConfirmProvider({ children }) {
  const t = useT();
  const [state, setState] = useState(null); // { message, resolve }

  const confirm = useCallback(
    (message) => new Promise((resolve) => setState({ message, resolve })),
    []
  );

  const close = (value) => {
    if (state) state.resolve(value);
    setState(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={() => close(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-msg">{state.message}</div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => close(false)}>{t('c.cancel')}</button>
              <button className="btn-primary modal-danger" onClick={() => close(true)}>{t('c.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
