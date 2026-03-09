export default function Loading() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div className="border-b border-b1">
        <div className="max-w-2xl mx-auto w-full px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <div className="h-3 w-12 skeleton-pulse rounded mb-2" />
            <div className="h-6 w-40 skeleton-pulse rounded" />
          </div>
          <div className="h-9 w-28 skeleton-pulse rounded-full" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0 space-y-3">
          <div className="flex justify-start">
            <div className="h-16 w-3/4 skeleton-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  )
}
