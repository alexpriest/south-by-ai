export function ScheduleSkeleton() {
  return (
    <main className="min-h-screen">
      {/* Header skeleton */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="h-3 w-16 skeleton-pulse rounded mb-2" />
              <div className="h-8 w-56 skeleton-pulse rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 skeleton-pulse rounded-full" />
              <div className="h-10 w-28 skeleton-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Day tabs */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-16 skeleton-pulse rounded-full" />
          ))}
        </div>

        {/* Session cards */}
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-5 border border-white/5">
              <div className="h-5 w-3/4 skeleton-pulse rounded mb-3" />
              <div className="h-4 w-full skeleton-pulse rounded mb-2" />
              <div className="h-4 w-2/3 skeleton-pulse rounded mb-3" />
              <div className="flex gap-3">
                <div className="h-3 w-24 skeleton-pulse rounded" />
                <div className="h-3 w-20 skeleton-pulse rounded" />
                <div className="h-3 w-16 skeleton-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
