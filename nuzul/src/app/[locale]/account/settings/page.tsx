import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import AccountSettingsForm from '@/components/AccountSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AccountSettingsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect('/login');
  const t = await getTranslations('account');

  const user = await prisma.user.findUnique({
    where: { id: session!.sub },
    select: { fullName: true, phone: true },
  });
  if (!user) redirect('/login');

  return (
    <div className="container-app max-w-md py-6">
      <h1 className="mb-4 text-xl font-extrabold">{t('editProfile')}</h1>
      <AccountSettingsForm fullName={user!.fullName} phone={user!.phone} />
    </div>
  );
}
