"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = Omit<HTMLMotionProps<"button">, "ref" | "children"> & {
  variant?: Variant;
  loading?: boolean;
  size?: "sm" | "md";
  children?: React.ReactNode;
};

const baseClass =
  "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.6)] hover:from-emerald-300 hover:to-emerald-400",
  secondary:
    "bg-zinc-50 text-zinc-900 hover:bg-white shadow-[0_8px_24px_-12px_rgba(255,255,255,0.4)]",
  ghost:
    "bg-white/0 text-zinc-200 border border-white/10 hover:bg-white/5 hover:border-white/20",
  danger:
    "bg-rose-950/40 border border-rose-700/50 text-rose-200 hover:bg-rose-900/40 hover:border-rose-600/60",
};

const sizeClass = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
};

export function PrimaryButton({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <motion.button
      whileHover={disabled || loading ? undefined : { y: -1 }}
      whileTap={disabled || loading ? undefined : { y: 0, scale: 0.985 }}
      transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
      disabled={disabled || loading}
      className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
      ) : null}
      {children}
    </motion.button>
  );
}
