import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, FileText, Lightbulb, Target } from 'lucide-react';

const MICRO_ARTICLES = [
  {
    id: '1',
    title: 'Question hooks outperform statements 2x',
    excerpt: 'Posts that open with a question get significantly more engagement. Try: "What if the best metric isn\'t what you track?"',
    category: 'Hook strategy',
    icon: Lightbulb,
  },
  {
    id: '2',
    title: 'Tuesday and Thursday are your sweet spot',
    excerpt: 'Your audience engages most mid-week. Schedule thought-leadership for Tue/Thu mornings.',
    category: 'Timing',
    icon: Target,
  },
  {
    id: '3',
    title: 'Operations content resonates most',
    excerpt: 'Topic cluster "operations" drives the highest engagement. Double down on frameworks and case studies.',
    category: 'Topic strategy',
    icon: FileText,
  },
];

const TEMPLATES = [
  { name: 'Story template', desc: 'Personal anecdote → Lesson → CTA', href: '#' },
  { name: 'Case study template', desc: 'Problem → Approach → Result', href: '#' },
  { name: 'X lessons from Y', desc: 'Numbered takeaways format', href: '#' },
  { name: 'Contrarian template', desc: 'Common belief → Your take → Proof', href: '#' },
];

export default function LearningHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Learning Hub</h1>
        <p className="mt-1 text-muted-foreground">
          Micro-articles, best practices, and AI-generated insights based on your patterns.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights for you
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MICRO_ARTICLES.map((a) => (
            <Card key={a.id} className="hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <span className="text-xs font-medium text-primary">{a.category}</span>
                <CardTitle className="text-base">{a.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{a.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Template library
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TEMPLATES.map((t) => (
            <Card key={t.name} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-4">
                <Link href={t.href} className="font-medium hover:text-primary">
                  {t.name}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Benchmark mode
          </CardTitle>
          <CardDescription>
            Compare your engagement vs average creators (mock data)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Your avg engagement</p>
              <p className="text-2xl font-bold">4.2%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Industry avg</p>
              <p className="text-2xl font-bold text-muted-foreground">2.8%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You're ahead</p>
              <p className="text-2xl font-bold text-emerald-600">+50%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
