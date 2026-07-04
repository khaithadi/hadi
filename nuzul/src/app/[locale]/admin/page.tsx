import Image from 'next/image';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import ModerationActions from '@/components/ModerationActions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('admin');

  const [users, hosts, approved, pendingList, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'host' } }),
    prisma.property.count({ where: { status: 'approved' } }),
    prisma.property.findMany({
      where: { status: 'pending' },
      include: { host: { select: { fullName: true } }, wilaya: true, images: { take: 1 } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.booking.count(),
  ]);

  const kpis = [
    { label: t('users'), value: String(users) },
    { label: t('hosts'), value: String(hosts) },
    { label: t('listings'), value: String(approved) },
    { label: t('bookings'), value: String(bookings) },
  ];

  const quickLinks = [
    { href: '/admin/users', label: t('users') },
    { href: '/admin/listings', label: t('listings') },
    { href: '/admin/bookings', label: t('bookings') },
  ];

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-extrabold">{t('dashboard')}</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-xs text-ink/50">{k.label}</p>
            <p className="mt-1 text-lg font-extrabold text-brand-700">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickLinks.map((q) => (
          <Link key={q.href} href={q.href} className="btn-ghost px-4 py-2 text-sm">{q.label}</Link>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-2 font-bold">{t('moderation')} ({pendingList.length})</h2>
        <div className="space-y-2">
          {pendingList.length === 0 && <p className="text-sm text-ink/40">—</p>}
          {pendingList.map((p) => (
            <div key={p.id} className="card flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-3">
                {p.images[0] && <Image src={p.images[0].url} alt="" width={64} height={56} className="h-14 w-16 rounded-lg object-cover" />}
                <div>
                  <p className="text-sm font-bold">{p.title}</p>
                  <p className="text-xs text-ink/50">{p.host.fullName} · {p.wilaya.nameAr} · {formatMoney(p.pricePerNight, loc)}</p>
                </div>
              </div>
              <ModerationActions propertyId={p.id} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
