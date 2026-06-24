import { redirect } from '@/lib/i18n/navigation';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HostLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getSession();
  // Guests are sent to register-as-host; visitors to login.
  if (!session) redirect('/login');
  if (session!.role !== 'host' && session!.role !== 'admin') redirect('/register');
  return <>{children}</>;
}
