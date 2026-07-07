export default function Account({ data, actions }) {
  const role = data.settings.role;

  return (
    <div className="page">
      <div className="section-title">الوضع</div>
      <div className="segmented">
        <button className={'seg' + (role === 'guest' ? ' active' : '')} onClick={() => actions.setRole('guest')}>
          مستأجر
        </button>
        <button className={'seg' + (role === 'host' ? ' active' : '')} onClick={() => actions.setRole('host')}>
          مالك
        </button>
      </div>
      <p className="hint-text">
        بدّل بين وضع المستأجر (تصفّح وحجز) ووضع المالك (إدارة عقاراتك وحجوزاتها).
      </p>

      <div className="section-title">اسمك</div>
      <input
        className="input"
        value={data.settings.userName || ''}
        onChange={(e) => actions.saveSettings({ userName: e.target.value })}
        placeholder="اسمك"
      />

      <div className="section-title">البيانات</div>
      <button className="btn-secondary" onClick={() => { if (window.confirm('تحميل بيانات تجريبية؟ سيُستبدل ما هو موجود.')) actions.loadDemo(); }}>
        تحميل بيانات تجريبية
      </button>
      <button className="btn-text-danger" onClick={() => { if (window.confirm('مسح كل البيانات؟ لا يمكن التراجع.')) actions.clearAll(); }}>
        مسح كل البيانات
      </button>

      <p className="hint-text">
        غابتي — تطبيق كراء يومي للغابات والفلل (نسخة تجريبية). تُحفظ البيانات محلياً في متصفحك فقط ولا تُرسل لأي خادم.
      </p>
    </div>
  );
}
