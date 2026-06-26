'use client';

import { usePathname } from '@/lib/i18n/navigation';

/**
 * Replays a soft blur-in animation on each route change (keyed by pathname).
 * Honours prefers-reduced-motion via the .page-in CSS (no animation there).
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-in">
      {children}
    </div>
  );
}
