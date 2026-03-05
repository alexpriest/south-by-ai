import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <p className="text-6xl mb-6 text-muted/30 font-heading font-bold">404</p>
      <h1 className="font-heading text-2xl font-bold mb-3">Schedule Not Found</h1>
      <p className="text-muted text-center max-w-md mb-8 text-sm">
        That schedule doesn&apos;t exist. Double-check the link — or it might&apos;ve been lost to the Austin heat.
      </p>
      <Link
        href="/"
        className="bg-primary text-white rounded-full px-8 py-3 font-semibold hover:bg-primary/90 transition-colors"
      >
        Build a New Schedule
      </Link>
    </main>
  )
}
