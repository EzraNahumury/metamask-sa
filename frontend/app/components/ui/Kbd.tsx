"use client";

import { cn } from "../../lib/utils";

export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded border border-white/[0.1] bg-white/[0.04] text-[10px] font-mono text-zinc-400 leading-none align-middle",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
