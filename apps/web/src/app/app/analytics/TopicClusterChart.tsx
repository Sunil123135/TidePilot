'use client';

type TopicPoint = {
  topic: string;
  engagement: number;
  color: string;
};

const TOPIC_COLORS = [
  'hsl(var(--primary))',
  'hsl(142 76% 36%)',
  'hsl(262 83% 58%)',
  'hsl(24 95% 53%)',
  'hsl(199 89% 48%)',
];

export function TopicClusterChart({ data }: { data?: TopicPoint[] }) {
  const points = data ?? [
    { topic: 'operations', engagement: 156, color: TOPIC_COLORS[0] },
    { topic: 'leadership', engagement: 98, color: TOPIC_COLORS[1] },
    { topic: 'strategy', engagement: 87, color: TOPIC_COLORS[2] },
    { topic: 'product', engagement: 72, color: TOPIC_COLORS[3] },
    { topic: 'execution', engagement: 65, color: TOPIC_COLORS[4] },
  ];

  const maxEngagement = Math.max(...points.map((p) => p.engagement), 1);
  const minR = 24;
  const maxR = 56;
  const centerX = 150;
  const centerY = 120;

  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 300 240" className="w-full max-w-md h-60">
        {points.map((p, i) => {
          const r = minR + (p.engagement / maxEngagement) * (maxR - minR);
          const angle = (i / points.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + Math.cos(angle) * 70;
          const y = centerY + Math.sin(angle) * 70;
          return (
            <g key={p.topic}>
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={p.color}
                opacity={0.6}
                className="transition-opacity hover:opacity-0.9"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-xs font-medium"
              >
                {p.topic}
              </text>
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {p.engagement}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {points.map((p, i) => (
          <div key={p.topic} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.topic}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
