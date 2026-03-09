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
        <h2 className="font-heading text-2xl font-bold mb-4">That broke.</h2>
        <p className="text-muted mb-6">
          Something went sideways loading this schedule. Give it another shot — these things usually sort themselves out.
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
