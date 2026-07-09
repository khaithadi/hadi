import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { formatMoney, formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import ExpenseForm from '@/components/ExpenseForm';
import DeleteExpenseButton from '@/components/DeleteExpenseButton';

export const dynamic = 'force-dynamic';

export default async function HostExpensesPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { property?: string };
}) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('host');
  const tc = await getTranslations('expenseCat');
  const session = (await getSession())!;

  const properties = await prisma.property.findMany({
    where: { hostId: session.sub },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  });

  const activeProperty = searchParams.property && properties.some((p) => p.id === searchParams.property)
    ? searchParams.property
    : undefined;

  const expenses = await prisma.expense.findMany({
    where: { hostId: session.sub, ...(activeProperty ? { propertyId: activeProperty } : {}) },
    include: { property: { select: { title: true } } },
    orderBy: { date: 'desc' },
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-extrabold">{t('expensesTitle')}</h1>

      {/* Property filter pills */}
      {properties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/host/expenses" className={activeProperty ? 'chip' : 'chip-selected'}>
            {t('allProperties')}
          </Link>
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/host/expenses?property=${p.id}`}
              className={activeProperty === p.id ? 'chip-selected' : 'chip'}
            >
              {p.title}
            </Link>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="card mt-4 flex items-center justify-between p-4">
        <p className="text-sm text-ink/60">{t('expenses')}</p>
        <p className="text-lg font-extrabold text-rose-600">{formatMoney(total, loc)}</p>
      </div>

      {/* Add form */}
      <ExpenseForm properties={properties} />

      {/* List */}
      <div className="stagger mt-4 space-y-2">
        {expenses.length === 0 ? (
          <p className="mt-8 text-center text-sm leading-relaxed text-ink/50">{t('noExpenses')}</p>
        ) : (
          expenses.map((e) => (
            <div key={e.id} className="card flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="badge-gray">{tc(e.category)}</span>
                  <p className="truncate text-sm font-bold">{e.property?.title ?? t('generalExpense')}</p>
                </div>
                <p className="mt-1 text-xs text-ink/50">
                  {formatDate(e.date, loc)}
                  {e.note ? ` · ${e.note}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-sm font-bold text-rose-600">{formatMoney(e.amount, loc)}</p>
                <DeleteExpenseButton id={e.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
