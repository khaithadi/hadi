// Instant skeleton shown by the App Router during server navigations —
// a shimmering stand-in for the typical card-grid page.
export default function Loading() {
  return (
    <div className="container-app py-6">
      <div className="skeleton h-7 w-40 rounded-lg" />
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="skeleton aspect-[4/3] w-full" />
            <div className="space-y-2 p-3">
              <div className="skeleton h-3.5 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
