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

const sizeClass = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl",
  md: "h-11 px-5 text-sm rounded-xl",
};

const variantClass: Record<Variant, string> = {
  primary: "btn-primary font-medium",
  secondary: "btn-secondary font-medium",
  ghost: "btn-ghost font-normal",
  danger: "btn-danger font-medium",
};

export function Btn({
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
      transition={{ duration: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed",
        sizeClass[size],
        variantClass[variant],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
      ) : null}
      {children}
    </motion.button>
  );
}
