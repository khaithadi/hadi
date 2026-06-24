import { Link } from '@/lib/i18n/navigation';

export default function NotFound() {
  return (
    <div className="container-app grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-5xl font-extrabold text-brand-700">404</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">→</Link>
      </div>
    </div>
  );
}
