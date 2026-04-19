import Link from 'next/link';

export function Navbar(): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1f1f1f]/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-lg font-semibold text-bucin-text">
          Web Bucin
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <a href="#counter" className="rounded-lg px-3 py-2 text-sm text-bucin-textSecondary transition hover:bg-white/10 hover:text-bucin-text">
            Counter
          </a>
          <a href="#countdown" className="rounded-lg px-3 py-2 text-sm text-bucin-textSecondary transition hover:bg-white/10 hover:text-bucin-text">
            Countdown
          </a>
          <a href="#celebration" className="rounded-lg px-3 py-2 text-sm text-bucin-textSecondary transition hover:bg-white/10 hover:text-bucin-text">
            Celebration
          </a>
          <Link href="/login" className="rounded-lg bg-bucin-gold px-3 py-2 text-sm font-semibold text-bucin-bg transition hover:bg-bucin-hover">
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
