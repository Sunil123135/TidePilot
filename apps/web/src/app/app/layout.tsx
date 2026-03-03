export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import {
  PenLine, Upload, Search, Mic, LayoutDashboard, FileText,
  CalendarDays, Target, Lightbulb, MessageSquare, BarChart2,
  Inbox, TrendingUp, Brain, Flag, GraduationCap, Settings,
  HelpCircle, Zap, Map, BookOpen,
} from 'lucide-react';

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
  { href: '/app/narrative', label: 'Narrative', icon: Map },
  { href: '/app/benchmark', label: 'Benchmark', icon: Zap },
  { href: '/app/growth', label: 'Growth', icon: TrendingUp },
  { href: '/app/knowledge', label: 'Knowledge', icon: Brain },
  { href: '/app/goals', label: 'Goals', icon: Flag },
  { href: '/app/learn', label: 'Learning Hub', icon: GraduationCap },
];

const BOTTOM_ITEMS = [
  { href: '/app/help', label: 'Help', icon: HelpCircle },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Dark sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-slate-900 flex flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center px-4 shrink-0 border-b border-slate-800">
          <Link href="/app" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-brand flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-wide">TidePilot</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 mt-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"
            >
              <Icon className="h-4 w-4 shrink-0 group-hover:text-violet-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="p-2 border-t border-slate-800 space-y-0.5">
          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"
            >
              <Icon className="h-4 w-4 shrink-0 group-hover:text-violet-400 transition-colors" />
              {label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/95 px-6 backdrop-blur shadow-sm">
          <div className="flex items-center gap-1">
            <Link
              href="/app/studio?action=search"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Search
              <kbd className="ml-1 hidden rounded border border-border bg-muted px-1 py-0.5 text-xs sm:inline-block">⌘K</kbd>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/app/inbox"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Writing
            </Link>
            <Link
              href="/app/studio"
              className="flex items-center gap-2 rounded-lg gradient-brand px-3 py-1.5 text-sm text-white hover:opacity-90 transition-opacity shadow-md shadow-violet-200"
            >
              <PenLine className="h-3.5 w-3.5" />
              Create Draft
            </Link>
            <UserButton />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
