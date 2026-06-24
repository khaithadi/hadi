import { setRequestLocale } from 'next-intl/server';
import AuthForm from '@/components/AuthForm';

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <div className="container-app pb-10"><AuthForm mode="register" /></div>;
}
