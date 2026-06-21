# غابتي · Ghabti

تطبيق ويب أول-جوال للكراء اليومي للغابات والفلل — على غرار Airbnb، مخصّص
للسوق الجزائري.

A mobile-first **daily rental marketplace for forests & villas** (Airbnb-style),
built for the Algerian market. Two roles in one app: **مستأجر (guest)** browses
and books, **مالك (host)** lists properties and manages reservations.

> تطبيق مستقل تماماً عن "ميثاق" في جذر المستودع — كود وبيانات منفصلة (مفتاح
> `localStorage` مختلف)، فلا يؤثّر أحدهما على الآخر.

## الوظائف

- **استكشف** — تصفّح العقارات مع بحث وفلترة حسب النوع (غابة/فيلا/شاليه/مزرعة/كوخ).
- **تفاصيل العقار** — صور، مرافق، سعر/ليلة، اختيار تواريخ مع حساب فوري للمجموع
  وفحص التوفّر (لا تداخل مع حجوزات قائمة).
- **الحجز** — تأكيد بالتواريخ وعدد الضيوف والاسم؛ يبدأ الحجز "بانتظار التأكيد".
- **حجوزاتي / المفضّلة** — متابعة حجوزات المستأجر وقائمة رغباته.
- **وضع المالك** — لوحة بالأرباح والإحصاءات، إضافة/تعديل/حذف عقارات (مع رفع صور)،
  وقبول/رفض الحجوزات الواردة.
- **حسابي** — تبديل الدور (مستأجر/مالك)، الاسم، تحميل بيانات تجريبية، ومسح الكل.

## التقنية

**React + Vite**، عربي RTL، خطوط Cairo + Tajawal، ثيم طبيعي (أخضر/خشبي/كريمي).
كل البيانات تُحفظ محلياً في المتصفح عبر `localStorage` (مفتاح
`forest-rental-data-v1`). المنطق الصِّرف في `src/lib` خالٍ من DOM ليسهُل اختباره
وإعادة استخدامه لاحقاً عند النقل إلى تطبيق جوال أصلي.

```bash
cd forest-rental
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
  styles.css             نظام التصميم (ثيم الطبيعة)
  lib/
    format.js            دوال المال/التاريخ/المعرّفات
    constants.js         أنواع العقارات، المرافق، المناطق، حالات الحجز
    calc.js              nightsBetween, bookingTotal, isRangeAvailable, hostMetrics
    storage.js           localStorage + البيانات التجريبية
  components/             TopBar, BottomNav, Fab, Ticket, StatusBadge,
                         ListingCard, Gallery, Stars, AmenityPicker, DateRangeFields
  views/                 Explore, ListingDetail, BookingConfirm, Bookings,
                         Favorites, HostDashboard, HostListings, ListingForm,
                         HostBookings, Account
scripts/calc.test.mjs    اختبارات طبقة الحساب
```
