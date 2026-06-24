# 08 — Wireframe Descriptions

Mobile-first, RTL by default. ASCII sketches describe layout intent.

## Home / Explore
```
┌───────────────────────────────┐
│ ☰  نُزُل            [lang][↦] │  sticky header
├───────────────────────────────┤
│  Hero (teal gradient)         │
│  "اكتشف إقامتك القادمة"        │
│  ┌─ SearchBar ──────────────┐ │  wilaya · in · out · guests · [بحث]
│  └──────────────────────────┘ │
├───────────────────────────────┤
│ إقامات مميّزة                  │
│ [card][card][card][card] …    │  2-col mobile / 4-col desktop
│ استكشف حسب الولاية [chips→]    │
│ لماذا نُزُل؟ [3 value cards]   │
├───────────────────────────────┤
│ [Explore][Trips][♥][Account]  │  bottom nav (mobile)
└───────────────────────────────┘
```

## Listing detail
```
┌ gallery (1 big + 4 grid) ─────┐
│ Title          ★4.7 (12)      │
│ wilaya · type                 │   ┌ Booking widget (sticky) ┐
│ chips: sleeps/rooms/beds/bath │   │ 9 900 دج / ليلة          │
│ description …                 │   │ [in] [out]  [guests]     │
│ Amenities ✓✓✓                 │   │ [payment method ▾]       │
│ House rules • • •             │   │ nightly×n, fee, service  │
│ Reviews [cards]               │   │ Total / Deposit / Balance│
│ Host card (avatar, superhost) │   │ [احجز الآن / اطلب الحجز]  │
└───────────────────────────────┘   └──────────────────────────┘
```

## Trips / Favorites
```
حجوزاتي                         المفضّلة
┌ photo │ title      [badge] ┐   [card][card]
│       │ in→out · ref · دج  │   [card][card]
└───────────────────────────┘
```

## Auth
```
┌ card ─────────────┐
│ [Guest][Host]     │ (register only)
│ name/email/phone  │
│ password          │
│ [متابعة]          │
│ demo accounts hint│ (login)
└───────────────────┘
```

## Host dashboard
```
لوحة المضيف            [＋ عقار]
[earnings][occupancy][listings][incoming]
الحجوزات الواردة:  row + [قبول][رفض]
عقاراتي:  [thumb title status price]
```

## Admin
```
KPIs: [users][hosts][listings][bookings][deposits]
مراجعة العقارات (n):  thumb title host wilaya price  [موافقة][رفض]
```
