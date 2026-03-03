import Link from 'next/link';
import { Mic, FileText, MessageSquare, BarChart2, Zap, Map, ArrowRight, Check, Star } from 'lucide-react';

const FEATURES = [
  { icon: Mic, title: 'Voice Lab', desc: 'AI extracts your unique tone, style, and signature moves from your writing.' },
  { icon: FileText, title: 'Draft Studio', desc: 'Write, rewrite to your voice, score quality, and publish to LinkedIn.' },
  { icon: MessageSquare, title: 'Engagement', desc: 'AI-suggested replies to comments — in your voice, prioritized by impact.' },
  { icon: Map, title: 'Narrative Map', desc: 'See your positioning vs competitors. Find authority gaps to own.' },
  { icon: Zap, title: 'Benchmark', desc: 'Paste competitor posts. Get hook patterns, topic gaps, your edge.' },
  { icon: BarChart2, title: 'Analytics', desc: 'Track likes, comments, shares and content performance over time.' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Startup Founder', text: 'TidePilot made my LinkedIn feel like me again — consistent, sharp, authentic.' },
  { name: 'Marcus L.', role: 'Executive Coach', text: 'The Voice Lab nailed my tone in minutes. Game-changer for my content workflow.' },
  { name: 'Priya M.', role: 'Product Leader', text: 'I went from 1 post/month to 3/week with zero extra effort. The Brief is magic.' },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-brand-text">TidePilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/app/help" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Help</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link
              href="/sign-up"
              className="gradient-brand text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg shadow-violet-200"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-300 rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-300 rounded-full opacity-10 blur-3xl" />

        <div className="container mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-sm px-4 py-1.5 rounded-full mb-6 font-medium">
            <Star className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
            Personal brand OS for professionals
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Your voice,{' '}
            <span className="gradient-brand-text">operationalized.</span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build your AI voice model, run your engagement cockpit, and get your
            weekly Operator Brief — everything you need to grow on LinkedIn consistently.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="gradient-brand text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-xl shadow-violet-200 flex items-center gap-2"
            >
              Start for free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="text-slate-600 px-8 py-4 rounded-xl font-medium text-lg border border-slate-200 hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              View pricing
            </Link>
          </div>

          <p className="text-sm text-slate-400 mt-4">No credit card required · Free forever plan available</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need to own your niche</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Six AI-powered modules that work together as one system.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50 transition-all group">
                <div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Loved by creators & executives</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-violet-500 text-violet-500" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-slate-400 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-brand">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to pilot your brand?</h2>
          <p className="text-violet-100 text-lg mb-8 max-w-lg mx-auto">
            Join professionals who publish consistently, engage authentically, and grow strategically.
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-violet-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-violet-50 transition-colors inline-flex items-center gap-2 shadow-xl"
          >
            Get started — it&apos;s free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-violet-200 text-sm">
            {['Free forever plan', 'No credit card', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded gradient-brand flex items-center justify-center">
              <Mic className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-sm gradient-brand-text">TidePilot</span>
          </div>
          <p className="text-xs text-slate-400">Personal brand operating system. No scraping. Import-only integrations.</p>
          <nav className="flex gap-4 text-xs text-slate-400">
            <Link href="/pricing" className="hover:text-slate-700">Pricing</Link>
            <Link href="/app/help" className="hover:text-slate-700">Help</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
