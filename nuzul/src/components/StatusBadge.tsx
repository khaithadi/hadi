const styles: Record<string, string> = {
  pending: 'badge-amber',
  confirmed: 'badge-green',
  completed: 'badge-green',
  declined: 'badge-red',
  cancelled: 'badge-red',
  expired: 'badge-red',
  approved: 'badge-green',
  rejected: 'badge-red',
  suspended: 'badge-red',
};

const labels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكَّد',
  completed: 'منتهٍ',
  declined: 'مرفوض',
  cancelled: 'ملغى',
  expired: 'منتهي الصلاحية',
  approved: 'منشور',
  rejected: 'مرفوض',
  suspended: 'موقوف',
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={styles[status] || 'chip'}>{labels[status] || status}</span>;
}
