'use client';

import { useEffect, useRef } from 'react';

/** Renders a progress bar fill; width is driven by CSS var --progress-width set in JS (no inline style in JSX). */
export function ProgressFill({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty('--progress-width', `${Math.min(percent, 100)}%`);
    }
  }, [percent]);
  return <div ref={ref} className={className} />;
}
