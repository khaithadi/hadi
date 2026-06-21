// Persistence layer — localStorage. Separate key from Mithaq so the two apps
// never share data. Also provides a normalize() guard and an Arabic demo seed.

import { uid } from './format.js';

const KEY = 'forest-rental-data-v1';

export function defaultData() {
  return {
    listings: [],
    bookings: [],
    expenses: [],
    favorites: [],
    settings: { role: 'guest', userId: 'me', userName: 'ضيف' },
    seq: { booking: 0 },
  };
}

// Merge any parsed object into the current shape so missing keys never crash.
export function normalize(raw) {
  const base = defaultData();
  if (!raw || typeof raw !== 'object') return base;
  return {
    listings: Array.isArray(raw.listings) ? raw.listings : [],
    bookings: Array.isArray(raw.bookings) ? raw.bookings : [],
    expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
    favorites: Array.isArray(raw.favorites) ? raw.favorites : [],
    settings: { ...base.settings, ...(raw.settings || {}) },
    seq:
      raw.seq && typeof raw.seq === 'object'
        ? { booking: Number(raw.seq.booking) || 0 }
        : base.seq,
  };
}

export function loadData() {
  try {
    const v = localStorage.getItem(KEY);
    if (v) return normalize(JSON.parse(v));
  } catch (e) {
    /* corrupt storage — fall through to an empty app */
  }
  const fresh = defaultData();
  saveData(fresh);
  return fresh;
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

export function exportBackup(data) {
  return JSON.stringify(data);
}

// Arabic demo data — Algerian destinations. Most listings belong to a demo host
// so the guest can browse; one belongs to the current user ('me') so the host
// side has content. Two bookings demonstrate both sides.
export function seedDemo() {
  const d = defaultData();
  const day = (off) => {
    const t = new Date();
    t.setDate(t.getDate() + off);
    return t.toISOString().slice(0, 10);
  };
  const iso = (off) => {
    const t = new Date();
    t.setDate(t.getDate() + off);
    return t.toISOString();
  };
  const L = (o) => {
    const l = { id: uid(), ownerId: 'demo-host', images: [], amenities: [], rating: 4.7, createdAt: iso(-10), ...o };
    d.listings.push(l);
    return l;
  };
  const booking = (o) => {
    d.seq.booking += 1;
    d.bookings.push({ id: uid(), number: '#' + String(d.seq.booking).padStart(4, '0'), guestPhone: '', createdAt: iso(-1), ...o });
  };

  const l1 = L({
    title: 'غابة تيكجدة الساحرة', type: 'forest', region: 'تيكجدة',
    pricePerNight: 4500, capacity: 6, bedrooms: 2, rating: 4.9,
    amenities: ['firepit', 'bbq', 'parking', 'view', 'pets'],
    description: 'مساحة غابية هادئة وسط أشجار الأرز، مثالية للتخييم العائلي والاسترخاء بعيداً عن صخب المدينة.',
  });
  L({
    title: 'فيلا بإطلالة بحرية', type: 'villa', region: 'سيدي فرج',
    pricePerNight: 18000, capacity: 8, bedrooms: 4, rating: 4.8,
    amenities: ['pool', 'wifi', 'ac', 'parking', 'kitchen', 'view'],
    description: 'فيلا فاخرة على بعد خطوات من الشاطئ، مع مسبح خاص وحديقة واسعة وإطلالة مباشرة على البحر.',
  });
  L({
    title: 'شاليه جبلي دافئ', type: 'chalet', region: 'الشريعة',
    pricePerNight: 7000, capacity: 5, bedrooms: 3, rating: 4.6,
    amenities: ['heating', 'wifi', 'kitchen', 'firepit', 'view'],
    description: 'شاليه خشبي أنيق في أعالي جبال الشريعة، تدفئة مركزية وإطلالة على القمم الثلجية شتاءً.',
  });
  L({
    title: 'مزرعة ريفية للعائلات', type: 'farm', region: 'تيبازة',
    pricePerNight: 9000, capacity: 10, bedrooms: 4, rating: 4.5,
    amenities: ['bbq', 'parking', 'pets', 'kitchen', 'pool'],
    description: 'مزرعة واسعة بأشجار مثمرة ومساحات خضراء، مناسبة للتجمعات العائلية والمناسبات.',
  });

  // Owned by the current user so the host side isn't empty.
  const mine = L({
    title: 'كوخ غابة جيجل', type: 'cabin', region: 'جيجل', ownerId: 'me',
    pricePerNight: 3500, capacity: 4, bedrooms: 1, rating: 4.4,
    amenities: ['firepit', 'bbq', 'view', 'pets'],
    description: 'كوخ خشبي صغير محاط بالغابة قرب الساحل، تجربة طبيعية أصيلة لقضاء عطلة هادئة.',
  });

  // A confirmed booking by the current user (shows on the guest side).
  booking({
    listingId: l1.id, guestId: 'me', guestName: 'ضيف',
    checkIn: day(7), checkOut: day(10), guests: 4,
    nights: 3, total: 3 * 4500 + Math.round(3 * 4500 * 0.05), status: 'confirmed', createdAt: iso(-2),
  });
  // An incoming pending booking on the user's own listing (host side).
  booking({
    listingId: mine.id, guestId: 'guest-samir', guestName: 'سمير حمداني', guestPhone: '0661 22 33 44',
    checkIn: day(14), checkOut: day(16), guests: 3,
    nights: 2, total: 2 * 3500 + Math.round(2 * 3500 * 0.05), status: 'pending',
  });

  // Demo expenses on the user's own listing (host side).
  d.expenses.push(
    { id: uid(), listingId: mine.id, ownerId: 'me', category: 'cleaning', amount: 2500, description: 'تنظيف بعد المغادرة', date: day(-3), receipt: null },
    { id: uid(), listingId: mine.id, ownerId: 'me', category: 'utilities', amount: 1800, description: 'فاتورة كهرباء وماء', date: day(-8), receipt: null },
    { id: uid(), listingId: mine.id, ownerId: 'me', category: 'maintenance', amount: 6000, description: 'إصلاح موقد النار', date: day(-15), receipt: null }
  );

  return d;
}
