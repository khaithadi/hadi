import { useEffect, useState } from 'react';
import { loadData, saveData, seedDemo, defaultData } from './lib/storage.js';
import { uid } from './lib/format.js';
import { bookingTotal } from './lib/calc.js';

import TopBar from './components/TopBar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Fab from './components/Fab.jsx';

import Explore from './views/Explore.jsx';
import ListingDetail from './views/ListingDetail.jsx';
import BookingConfirm from './views/BookingConfirm.jsx';
import Bookings from './views/Bookings.jsx';
import Favorites from './views/Favorites.jsx';
import HostDashboard from './views/HostDashboard.jsx';
import HostListings from './views/HostListings.jsx';
import ListingForm from './views/ListingForm.jsx';
import HostBookings from './views/HostBookings.jsx';
import HostExpenses from './views/HostExpenses.jsx';
import ExpenseForm from './views/ExpenseForm.jsx';
import Account from './views/Account.jsx';

const TITLES = {
  favorites: () => 'المفضّلة',
  bookings: () => 'حجوزاتي',
  account: () => 'حسابي',
  bookingConfirm: () => 'تأكيد الحجز',
  hostDashboard: () => 'لوحة المالك',
  hostListings: () => 'عقاراتي',
  hostBookings: () => 'الحجوزات الواردة',
  hostExpenses: () => 'المصاريف',
  listingForm: (e) => (e ? 'تعديل العقار' : 'عقار جديد'),
  expenseForm: (e) => (e ? 'تعديل مصروف' : 'مصروف جديد'),
};

const GUEST_TABS = ['explore', 'favorites', 'bookings', 'account'];
const HOST_TABS = ['hostDashboard', 'hostListings', 'hostBookings', 'hostExpenses', 'account'];
// Views with no bottom nav (full-screen / form context).
const FULLSCREEN_VIEWS = ['listing', 'listingForm', 'bookingConfirm', 'expenseForm'];
// Views that render their own header instead of the shared TopBar.
const NO_TOPBAR = ['explore', 'listing'];

export default function App() {
  const [data, setData] = useState(defaultData());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('explore');
  const [active, setActive] = useState({}); // { listingId }
  const [editing, setEditing] = useState(null); // listing / expense being edited
  const [draft, setDraft] = useState(null); // pending booking { checkIn, checkOut, guests }
  const [returnTo, setReturnTo] = useState('explore');

  useEffect(() => {
    const d = loadData();
    setData(d);
    setView(d.settings.role === 'host' ? 'hostDashboard' : 'explore');
    setLoading(false);
  }, []);

  function persist(next) {
    setData(next);
    saveData(next);
  }
  function nextNumber(next) {
    next.seq = { ...next.seq, booking: (next.seq.booking || 0) + 1 };
    return '#' + String(next.seq.booking).padStart(4, '0');
  }

  /* ---------------------------- mutators --------------------------- */
  const actions = {
    saveListing(listing) {
      let next;
      let saved = listing;
      if (listing.id) {
        next = { ...data, listings: data.listings.map((l) => (l.id === listing.id ? { ...l, ...listing } : l)) };
      } else {
        saved = { ...listing, id: uid(), ownerId: data.settings.userId, rating: listing.rating || 5, createdAt: new Date().toISOString() };
        next = { ...data, listings: [saved, ...data.listings] };
      }
      persist(next);
      return saved;
    },
    deleteListing(id) {
      persist({
        ...data,
        listings: data.listings.filter((l) => l.id !== id),
        bookings: data.bookings.filter((b) => b.listingId !== id),
        expenses: (data.expenses || []).filter((e) => e.listingId !== id),
        favorites: data.favorites.filter((f) => f !== id),
      });
    },
    saveBooking(b) {
      const next = { ...data };
      const saved = {
        ...b,
        id: uid(),
        number: nextNumber(next),
        guestId: data.settings.userId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      next.bookings = [saved, ...data.bookings];
      persist(next);
      return saved;
    },
    setBookingStatus(id, status) {
      persist({ ...data, bookings: data.bookings.map((b) => (b.id === id ? { ...b, status } : b)) });
    },
    saveExpense(expense) {
      let next;
      if (expense.id) {
        next = { ...data, expenses: data.expenses.map((e) => (e.id === expense.id ? { ...e, ...expense } : e)) };
      } else {
        next = { ...data, expenses: [{ ...expense, id: uid(), ownerId: data.settings.userId }, ...(data.expenses || [])] };
      }
      persist(next);
    },
    deleteExpense(id) {
      persist({ ...data, expenses: (data.expenses || []).filter((e) => e.id !== id) });
    },
    toggleFavorite(id) {
      const favorites = data.favorites.includes(id)
        ? data.favorites.filter((x) => x !== id)
        : [id, ...data.favorites];
      persist({ ...data, favorites });
    },
    setRole(role) {
      persist({ ...data, settings: { ...data.settings, role } });
      setView(role === 'host' ? 'hostDashboard' : 'explore');
    },
    saveSettings(s) {
      persist({ ...data, settings: { ...data.settings, ...s } });
    },
    loadDemo() {
      const d = seedDemo();
      persist(d);
      setView(d.settings.role === 'host' ? 'hostDashboard' : 'explore');
    },
    clearAll() {
      const d = defaultData();
      persist(d);
      setView('explore');
    },
  };

  /* --------------------------- navigation -------------------------- */
  const nav = {
    go(v) { setEditing(null); setView(v); },
    openListing(id) {
      setActive((a) => ({ ...a, listingId: id }));
      if (view !== 'listing') setReturnTo(view);
      setView('listing');
    },
    book(listingId, d) {
      setActive((a) => ({ ...a, listingId }));
      setDraft(d);
      setReturnTo('listing');
      setView('bookingConfirm');
    },
    newListing() { setEditing(null); setReturnTo('hostListings'); setView('listingForm'); },
    editListing(l) { setEditing(l); setReturnTo('hostListings'); setView('listingForm'); },
    newExpense() { setEditing(null); setReturnTo('hostExpenses'); setView('expenseForm'); },
    editExpense(e) { setEditing(e); setReturnTo('hostExpenses'); setView('expenseForm'); },
    back() { setEditing(null); setView(returnTo || 'explore'); },
  };

  if (loading) {
    return (
      <div className="app-root">
        <div className="loading-screen">جاري التحميل…</div>
      </div>
    );
  }

  const role = data.settings.role;
  const TAB_VIEWS = role === 'host' ? HOST_TABS : GUEST_TABS;
  const activeListing = data.listings.find((l) => l.id === active.listingId);
  const showBack = !TAB_VIEWS.includes(view);
  const titleFn = TITLES[view] || (() => 'غابتي');
  const showFab = role === 'host' && (view === 'hostListings' || view === 'hostExpenses');

  return (
    <div className="app-root">
      <div className="shell">
        {!NO_TOPBAR.includes(view) && <TopBar title={titleFn(editing)} showBack={showBack} onBack={nav.back} />}
        <div className="content">
          {view === 'explore' && <Explore data={data} nav={nav} actions={actions} />}
          {view === 'favorites' && <Favorites data={data} nav={nav} actions={actions} />}
          {view === 'bookings' && <Bookings data={data} nav={nav} />}
          {view === 'account' && <Account data={data} actions={actions} />}

          {view === 'listing' && activeListing && (
            <ListingDetail listing={activeListing} data={data} nav={nav} actions={actions} />
          )}
          {view === 'bookingConfirm' && activeListing && draft && (
            <BookingConfirm
              listing={activeListing}
              draft={draft}
              data={data}
              onCancel={nav.back}
              onConfirm={(g) => {
                const c = bookingTotal(activeListing, draft.checkIn, draft.checkOut);
                actions.saveBooking({
                  listingId: activeListing.id,
                  checkIn: draft.checkIn,
                  checkOut: draft.checkOut,
                  guests: draft.guests,
                  nights: c.nights,
                  total: c.total,
                  ...g,
                });
                setView('bookings');
              }}
            />
          )}

          {view === 'hostDashboard' && <HostDashboard data={data} nav={nav} />}
          {view === 'hostListings' && <HostListings data={data} nav={nav} />}
          {view === 'hostBookings' && <HostBookings data={data} actions={actions} />}
          {view === 'hostExpenses' && <HostExpenses data={data} nav={nav} />}
          {view === 'listingForm' && (
            <ListingForm
              initial={editing}
              onCancel={nav.back}
              onSave={(l) => { actions.saveListing(l); nav.back(); }}
              onDelete={editing ? () => { actions.deleteListing(editing.id); nav.back(); } : null}
            />
          )}
          {view === 'expenseForm' && (
            <ExpenseForm
              initial={editing}
              listings={data.listings.filter((l) => l.ownerId === data.settings.userId)}
              onCancel={nav.back}
              onSave={(e) => { actions.saveExpense(e); nav.back(); }}
              onDelete={editing ? () => { actions.deleteExpense(editing.id); nav.back(); } : null}
            />
          )}
        </div>

        {showFab && <Fab onClick={view === 'hostExpenses' ? nav.newExpense : nav.newListing} />}
        {!FULLSCREEN_VIEWS.includes(view) && <BottomNav role={role} active={view} onChange={nav.go} />}
      </div>
    </div>
  );
}
