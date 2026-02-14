'use client';

type DataPoint = { date: string; count: number };

export function EngagementChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded border border-border bg-muted/30 text-sm text-muted-foreground">
        No data to display
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;
  const barWidth = chartWidth / data.length - 10;

  return (
    <div className="overflow-x-auto">
      <svg width={chartWidth} height={chartHeight + padding} className="w-full">
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight - ratio * chartHeight + padding;
          const value = Math.round(ratio * maxCount);
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="currentColor"
                strokeWidth={0.5}
                className="text-muted-foreground opacity-30"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-xs"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((point, i) => {
          const barHeight = (point.count / maxCount) * chartHeight;
          const x = padding + i * (barWidth + 10);
          const y = chartHeight + padding - barHeight;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                className="fill-primary opacity-70"
                rx={2}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + padding + 15}
                textAnchor="middle"
                className="fill-muted-foreground text-xs"
              >
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
