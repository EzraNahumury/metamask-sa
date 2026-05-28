"use client";

import Image from "next/image";
import { cn } from "../../lib/utils";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { px: number; cls: string }> = {
  sm: { px: 28, cls: "h-7 w-7" },
  md: { px: 40, cls: "h-10 w-10" },
  lg: { px: 56, cls: "h-14 w-14" },
};

export function Logo({ size = "md", className }: { size?: Size; className?: string }) {
  const s = sizeMap[size];
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center",
        s.cls,
        className,
      )}
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/30 via-sky-400/15 to-violet-400/20 blur-xl opacity-70" />
      <span className="relative inline-flex items-center justify-center rounded-2xl overflow-hidden">
        <Image
          src="/lm-removebg-preview.png"
          width={s.px}
          height={s.px}
          alt="DeleGate.AI"
          priority
          className="object-contain"
        />
      </span>
    </span>
  );
}
