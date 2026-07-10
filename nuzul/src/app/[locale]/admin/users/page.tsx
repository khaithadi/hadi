import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import AdminUserActions from '@/components/AdminUserActions';

export const dynamic = 'force-dynamic';

const roleKey: Record<string, string> = { guest: 'roleGuest', host: 'roleHost', admin: 'roleAdmin' };

export default async function AdminUsersPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const session = (await getSession())!;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true },
    take: 200,
  });

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-extrabold">{t('users')}</h1>

      <div className="stagger mt-4 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="card flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold">{u.fullName}</p>
                <span className="chip">{t(roleKey[u.role] ?? u.role)}</span>
                {!u.isActive && <span className="badge-red">{t('suspended')}</span>}
              </div>
              <p className="truncate text-xs text-ink/50">{u.email || u.phone || '—'}</p>
            </div>
            <AdminUserActions userId={u.id} role={u.role} isActive={u.isActive} self={u.id === session.sub} />
          </div>
        ))}
      </div>
    </div>
  );
}
