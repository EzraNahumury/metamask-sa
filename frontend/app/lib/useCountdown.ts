"use client";

import { useEffect, useState } from "react";

/**
 * Resets every time `anchor` changes, then counts down `intervalSeconds`
 * to 0 and stops. Use to display "next tick in 24s" between SSE
 * `tick.finished` events.
 */
export function useCountdown(anchor: string | null, intervalSeconds: number) {
  const [remaining, setRemaining] = useState(intervalSeconds);

  useEffect(() => {
    if (!anchor) {
      setRemaining(intervalSeconds);
      return;
    }
    const start = Date.now();
    setRemaining(intervalSeconds);
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const r = Math.max(0, intervalSeconds - elapsed);
      setRemaining(r);
      if (r === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [anchor, intervalSeconds]);

  return remaining;
}
