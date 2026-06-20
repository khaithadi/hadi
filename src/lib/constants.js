// Reference data — Arabic labels, reusing the original MVP palette tokens.

// Customer journey (status). `color` values come from the existing CSS variables.
export const CUSTOMER_STATUSES = [
  { id: 'new',         label: 'جديد',        color: 'var(--ink-soft)' },
  { id: 'site_visit',  label: 'زيارة موقع',  color: 'var(--indigo)' },
  { id: 'quote_sent',  label: 'عرض مُرسل',   color: '#7A5C9E' },
  { id: 'approved',    label: 'مقبول',       color: '#B8862F' },
  { id: 'in_progress', label: 'قيد التنفيذ', color: 'var(--copper)' },
  { id: 'completed',   label: 'مكتمل',       color: 'var(--success)' },
];

export const QUOTE_STATUSES = [
  { id: 'draft',    label: 'مسودة',  color: 'var(--ink-soft)' },
  { id: 'sent',     label: 'مُرسل',  color: 'var(--indigo)' },
  { id: 'accepted', label: 'مقبول',  color: 'var(--success)' },
  { id: 'rejected', label: 'مرفوض',  color: 'var(--danger)' },
];

export const INVOICE_STATUSES = [
  { id: 'unpaid',  label: 'غير مدفوعة',     color: 'var(--danger)' },
  { id: 'partial', label: 'مدفوعة جزئياً',  color: '#B8862F' },
  { id: 'paid',    label: 'مدفوعة',         color: 'var(--success)' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'materials', label: 'مواد',         color: '#8B5E3C' },
  { id: 'labor',     label: 'يد عاملة',     color: '#2E4057' },
  { id: 'food',      label: 'طعام',         color: '#A6603A' },
  { id: 'fuel',      label: 'وقود',         color: '#5B6770' },
  { id: 'transport', label: 'نقل',          color: '#6B6F76' },
  { id: 'tools',     label: 'أدوات ومعدات', color: '#7A5C9E' },
  { id: 'other',     label: 'أخرى',         color: '#9C8A6B' },
];

export const SERVICE_TYPES = [
  'جبس بلاكو',
  'ديكور داخلي',
  'كهرباء',
  'سباكة',
  'دهن',
  'ألمنيوم',
  'بناء',
  'أخرى',
];

export const LEAD_SOURCES = [
  'توصية',
  'فيسبوك',
  'انستغرام',
  'زيارة مباشرة',
  'مكالمة هاتفية',
  'أخرى',
];

export const PAYMENT_METHODS = ['نقداً', 'تحويل بنكي', 'شيك', 'أخرى'];

// Worker types: project-based (per job) or monthly salary (general overhead).
export const WORKER_TYPES = [
  { id: 'project', label: 'بالمشروع' },
  { id: 'monthly', label: 'شهري (راتب)' },
];

// Units for a "measured" labor due (quantity × unit price).
export const LABOR_UNITS = ['ساعة', 'يوم', 'متر', 'متر²', 'قطعة', 'مخصّص'];

export const DEFAULT_TAX_RATE = 19;

// Look up a reference entry by id, with a safe fallback to the first item.
export function meta(list, id) {
  return list.find((x) => x.id === id) || list[0];
}
