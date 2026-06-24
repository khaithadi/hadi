export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#0f8585" />
        <path d="M8 21V12l8-5 8 5v9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 21v-5h6v5" stroke="#aeece8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-brand-700">نُزُل</span>
    </span>
  );
}
