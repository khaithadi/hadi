import { useState } from 'react';
import { ArtInvoice, ArtCustomers, ArtProfits } from '../components/OnboardingArt.jsx';
import { useT } from '../lib/i18n.js';

// Three slides. Dots flow LEFT→RIGHT (matches the reference designs); the
// pill/active dot moves as the index grows. Skip is hidden on the last slide,
// and the CTA becomes "start now" there.
export default function Onboarding({ onDone }) {
  const t = useT();
  const [i, setI] = useState(0);
  const slides = [
    { Art: ArtInvoice,   title: t('onb.invoices.title'),  body: t('onb.invoices.body') },
    { Art: ArtCustomers, title: t('onb.customers.title'), body: t('onb.customers.body') },
    { Art: ArtProfits,   title: t('onb.profits.title'),   body: t('onb.profits.body') },
  ];
  const isLast = i === slides.length - 1;
  const Cur = slides[i].Art;

  return (
    <div className="onb">
      <div className="onb-topbar">
        {!isLast && (
          <button className="onb-skip" onClick={onDone}>{t('onb.skip')}</button>
        )}
      </div>

      <div className="onb-hero">
        <Cur />
      </div>

      <div className="onb-copy">
        <h1 className="onb-title">{slides[i].title}</h1>
        <p className="onb-body">{slides[i].body}</p>
      </div>

      <div className="onb-dots">
        {slides.map((_, idx) => (
          <span key={idx} className={'onb-dot' + (idx === i ? ' active' : '')} />
        ))}
      </div>

      <button
        className="btn-primary onb-cta"
        onClick={() => (isLast ? onDone() : setI(i + 1))}
      >
        {isLast ? t('onb.startNow') : t('onb.next')}
      </button>
    </div>
  );
}
