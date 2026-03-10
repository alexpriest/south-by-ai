import { QuizFlow } from '@/components/quiz/quiz-flow'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 md:px-8 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight mb-6">
            <span className="text-gradient">Your SXSW,</span>
            <br />
            <span className="text-text">Actually Planned</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-xl mx-auto mb-3">
            Tell us what you&apos;re into. AI builds your schedule.
            <br className="hidden md:block" />
            {' '}No more 47 open tabs.
          </p>
          <p className="text-sm text-muted max-w-lg mx-auto mb-4">
            4,000+ sessions. You&apos;re not reading all those descriptions. Take a 60-second quiz and get a SXSW schedule you&apos;ll actually follow.
          </p>
          <a
            href="https://schedule.sxsw.com/2026/search/event"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-accent transition-colors underline underline-offset-2"
          >
            Or browse all sessions on sxsw.com.
          </a>
        </div>
      </section>

      {/* Quiz */}
      <section className="px-4 md:px-8 pb-16">
        <QuizFlow />
      </section>

      <footer className="border-t border-b1 py-8 text-center text-xs text-muted">
        <p>
          Built by{' '}
          <a href="https://alexpriest.com" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors underline underline-offset-2">
            Alex Priest
          </a>
          {' '}with Claude.
        </p>
        <p className="mt-2">
          <a href="https://buymeacoffee.com/alexpriest" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors underline underline-offset-2">
            Buy me a coffee ☕
          </a>
        </p>
        <p className="mt-2">
          Not affiliated with or endorsed by SXSW LLC. Session data from the public SXSW schedule.
        </p>
      </footer>
    </main>
  )
}
