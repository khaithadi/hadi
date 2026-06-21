// Reference data — Arabic labels for the forest/villa rental app.

export const ROLES = { GUEST: 'guest', HOST: 'host' };

// Property types. `g1`/`g2` are the gradient colors used for the placeholder
// cover when a listing has no uploaded photos (avoids relying on remote images).
export const PROPERTY_TYPES = [
  { id: 'forest', label: 'غابة',  g1: '#2F5D3A', g2: '#1E3D26' },
  { id: 'villa',  label: 'فيلا',  g1: '#3A6B8A', g2: '#27506B' },
  { id: 'chalet', label: 'شاليه', g1: '#8B5E3C', g2: '#5E3C24' },
  { id: 'farm',   label: 'مزرعة', g1: '#7A8B3C', g2: '#56632A' },
  { id: 'cabin',  label: 'كوخ',   g1: '#6B6F76', g2: '#444A52' },
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
  { id: 'pending',   label: 'بانتظار التأكيد', color: '#B8862F' },
  { id: 'confirmed', label: 'مؤكّد',           color: 'var(--success)' },
  { id: 'cancelled', label: 'ملغى',            color: 'var(--danger)' },
  { id: 'completed', label: 'مكتمل',           color: 'var(--ink-soft)' },
];

// Lookup helper — returns the matching entry or a safe fallback.
export function meta(list, id) {
  return list.find((x) => x.id === id) || { label: id, color: 'var(--ink-soft)' };
}
