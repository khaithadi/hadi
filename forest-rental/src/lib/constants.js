// Reference data — Arabic labels for the forest/villa rental app.

export const ROLES = { GUEST: 'guest', HOST: 'host' };

// Property types. `g1`/`g2` are the gradient colors used for the placeholder
// cover when a listing has no uploaded photos (avoids relying on remote images).
export const PROPERTY_TYPES = [
  { id: 'forest', label: 'غابة',  g1: '#3C6E71', g2: '#16242A' },
  { id: 'villa',  label: 'فيلا',  g1: '#4A6B8A', g2: '#1C2A36' },
  { id: 'chalet', label: 'شاليه', g1: '#6D6875', g2: '#2B2B30' },
  { id: 'farm',   label: 'مزرعة', g1: '#5B6B3A', g2: '#262E18' },
  { id: 'cabin',  label: 'كوخ',   g1: '#7A5C4A', g2: '#2E2018' },
];

export const REGIONS = [
  'تيكجدة', 'الشريعة', 'سيدي فرج', 'زرالدة', 'تيبازة', 'جيجل',
  'بجاية', 'تلمسان', 'عنابة', 'سطيف', 'وهران', 'الجزائر العاصمة',
];

export const AMENITIES = [
  { id: 'wifi',    label: 'واي فاي' },
  { id: 'pool',    label: 'مسبح' },
  { id: 'parking', label: 'موقف سيارات' },
  { id: 'bbq',     label: 'شواء' },
  { id: 'ac',      label: 'تكييف' },
  { id: 'heating', label: 'تدفئة' },
  { id: 'kitchen', label: 'مطبخ' },
  { id: 'firepit', label: 'موقد نار' },
  { id: 'pets',    label: 'حيوانات أليفة' },
  { id: 'view',    label: 'إطلالة' },
];

export const BOOKING_STATUSES = [
  { id: 'pending',   label: 'بانتظار التأكيد', color: '#E0A82E' },
  { id: 'confirmed', label: 'مؤكّد',           color: '#2E9E5B' },
  { id: 'cancelled', label: 'ملغى',            color: '#D9534F' },
  { id: 'completed', label: 'مكتمل',           color: '#6C757D' },
];

// Expense categories for the host's per-property expense tracking.
export const EXPENSE_CATEGORIES = [
  { id: 'maintenance', label: 'صيانة',    color: '#8C6D4F' },
  { id: 'cleaning',    label: 'تنظيف',    color: '#2E9E5B' },
  { id: 'utilities',   label: 'فواتير',   color: '#3A6B8A' },
  { id: 'supplies',    label: 'مستلزمات', color: '#7A5C9E' },
  { id: 'taxes',       label: 'ضرائب',    color: '#C0492F' },
  { id: 'other',       label: 'أخرى',     color: '#6C757D' },
];

// Lookup helper — returns the matching entry or a safe fallback.
export function meta(list, id) {
  return list.find((x) => x.id === id) || { label: id, color: 'var(--ink-soft)' };
}
