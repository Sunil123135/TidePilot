'use client';

type ContentTypeData = {
  type: string;
  engagement: number;
  count: number;
};

export function ContentTypeChart({ data }: { data?: ContentTypeData[] }) {
  const items = data ?? [
    { type: 'Story', engagement: 4.2, count: 12 },
    { type: 'Framework', engagement: 3.8, count: 8 },
    { type: 'Contrarian', engagement: 5.1, count: 5 },
    { type: 'Data-led', engagement: 3.5, count: 6 },
  ];

  const maxEngagement = Math.max(...items.map((i) => i.engagement), 1);
  const barHeight = 28;
  const gap = 12;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.type} className="flex items-center gap-3">
          <span className="w-20 text-sm text-muted-foreground shrink-0">{item.type}</span>
          <div className="flex-1 h-6 bg-muted/50 rounded-md overflow-hidden">
            <div
              className="h-full bg-primary/70 rounded-md transition-all duration-500"
              style={{ width: `${(item.engagement / maxEngagement) * 100}%` }}
            />
          </div>
          <span className="w-16 text-sm font-medium text-right shrink-0">
            {item.engagement}%
          </span>
        </div>
      ))}
    </div>
  );
}
