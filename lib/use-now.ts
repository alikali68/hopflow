'use client';

import { useEffect, useState } from 'react';

/**
 * A ticking clock, SSR-safe: null until mounted (server and client render
 * agree), then a Date that updates every `intervalMs`. Use it for live
 * countdowns and relative times — never `new Date()` during render, which
 * would risk a hydration mismatch.
 */
export function useNow(intervalMs = 30000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return now;
}
