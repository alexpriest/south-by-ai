'use client'

export default function ScheduleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="font-heading text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted mb-6">
          We hit a snag loading this schedule. It might be a temporary issue.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
