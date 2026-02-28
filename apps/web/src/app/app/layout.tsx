import Link from 'next/link';
import { PenLine, Upload, Search, Mic, LayoutDashboard, FileText, CalendarDays, Target, Lightbulb, MessageSquare, BarChart2, Inbox, TrendingUp, Brain, Flag, GraduationCap, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/app', label: 'Brief', icon: LayoutDashboard },
  { href: '/app/studio', label: 'Studio', icon: FileText },
  { href: '/app/voice', label: 'Voice Lab', icon: Mic },
  { href: '/app/engagement', label: 'Engagement', icon: MessageSquare },
  { href: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/app/strategy', label: 'Strategy', icon: Target },
  { href: '/app/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/app/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/app/inbox', label: 'Inbox', icon: Inbox },
  { href: '/app/growth', label: 'Growth', icon: TrendingUp },
  { href: '/app/knowledge', label: 'Knowledge', icon: Brain },
  { href: '/app/goals', label: 'Goals', icon: Flag },
  { href: '/app/learn', label: 'Learning Hub', icon: GraduationCap },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

function isValidClerkKey(key: string | undefined) {
  if (!key) return false;
  const match = key.match(/^pk_(test|live)_(.+)$/);
  return !!match && match[2].length > 20 && match[2].endsWith('$');
}

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const useClerk = isValidClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  let UserButtonEl: React.ReactNode = null;
  if (useClerk) {
    const { UserButton } = await import('@clerk/nextjs');
    UserButtonEl = <UserButton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-card flex flex-col">
        <div className="flex h-14 items-center border-b border-border px-4 shrink-0">
          <Link href="/app" className="font-semibold text-primary">TidePilot</Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
          <div className="flex items-center gap-1">
            <Link
              href="/app/studio?action=search"
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Search
              <kbd className="ml-1 hidden rounded border border-border bg-muted px-1 py-0.5 text-xs sm:inline-block">⌘K</kbd>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/app/inbox"
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Writing
            </Link>
            <Link
              href="/app/studio"
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <PenLine className="h-3.5 w-3.5" />
              Create Draft
            </Link>
            {UserButtonEl}
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
