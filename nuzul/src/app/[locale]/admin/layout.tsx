import { redirect } from '@/lib/i18n/navigation';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session!.role !== 'admin') redirect('/');
  return <>{children}</>;
}
