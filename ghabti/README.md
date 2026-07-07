# غابتي · Ghabti

تطبيق ويب أول-جوال للكراء اليومي للغابات والفلل — على غرار Airbnb، مخصّص
للسوق الجزائري.

A mobile-first **daily rental marketplace for forests & villas** (Airbnb-style),
built for the Algerian market. Two roles in one app: **مستأجر (guest)** browses
and books, **مالك (host)** lists properties and manages reservations.

> تطبيق مستقل تماماً عن "ميثاق" في جذر المستودع — كود وبيانات منفصلة (مفتاح
> `localStorage` مختلف)، فلا يؤثّر أحدهما على الآخر.

## الوظائف

- **استكشف** — ترويسة ترحيب + بحث وفلترة حسب النوع (غابة/فيلا/شاليه/مزرعة/كوخ)،
  مع **بطاقة مميّزة** وقائمة العقارات.
- **تفاصيل العقار** — تبويبات (التفاصيل/المرافق/الحجز)، صورة هيرو، وتقييم.
- **التقويم** — المستأجر يختار تواريخه من تقويم بصري (الأيام المحجوزة معطّلة)، والمالك
  يرى حجوزاته ملوّنة على تقويم شهري (مؤكّد/معلّق).
- **الحجز** — حساب فوري للمجموع + رسوم الخدمة وفحص التوفّر؛ يبدأ "بانتظار التأكيد".
- **حجوزاتي / المفضّلة** — متابعة حجوزات المستأجر وقائمة رغباته.
- **وضع المالك** — لوحة بصافي الربح والإحصاءات، إضافة/تعديل/حذف عقارات (مع رفع صور)،
  قبول/رفض الحجوزات، و**تتبّع مصاريف كل عقار** (فئات + إيصال) مع صافي الربح.
- **حسابي** — تبديل الدور (مستأجر/مالك)، الاسم، تحميل بيانات تجريبية، ومسح الكل.

## التقنية

**React + Vite**، عربي RTL، خطوط Instrument Sans + IBM Plex Sans Arabic، ثيم أحادي
أنيق (أبيض/رمادي/أسود) مع شريط سفلي داكن عائم. كل البيانات تُحفظ محلياً في المتصفح
عبر `localStorage` (مفتاح `forest-rental-data-v1`). المنطق الصِّرف في `src/lib` خالٍ
من DOM ليسهُل اختباره وإعادة استخدامه لاحقاً عند النقل إلى تطبيق جوال أصلي.

```bash
cd ghabti
npm install
npm run dev          # خادم تطوير محلي
npm run build        # بناء للإنتاج → dist/
npm run preview      # معاينة بناء الإنتاج
npm run test:calc    # اختبارات طبقة الحساب
```

## البنية

```
index.html               قشرة RTL + خطوط Google
src/
  main.jsx  App.jsx       قشرة التطبيق: الحالة، التنقّل، الطفرات
  styles.css             نظام التصميم (ثيم TripVibe الأحادي)
  lib/
    format.js            دوال المال/التاريخ/المعرّفات
    constants.js         أنواع العقارات، المرافق، المناطق، حالات الحجز، فئات المصاريف
    calc.js              nightsBetween, bookingTotal, isRangeAvailable,
                         eachNight, occupiedDates, listingExpenses, hostMetrics
    storage.js           localStorage + البيانات التجريبية
  components/             TopBar, BottomNav, Fab, Ticket, StatusBadge,
                         ListingCard, Stars, AmenityPicker, Calendar
  views/                 Explore, ListingDetail, BookingConfirm, Bookings,
                         Favorites, HostDashboard, HostListings, ListingForm,
                         HostBookings, HostExpenses, ExpenseForm, Account
scripts/calc.test.mjs    اختبارات طبقة الحساب
```
