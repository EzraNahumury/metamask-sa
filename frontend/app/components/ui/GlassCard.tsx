"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

type Variant = "default" | "strong";

type Props = Omit<HTMLMotionProps<"div">, "ref" | "children"> & {
  variant?: Variant;
  hoverable?: boolean;
  children?: React.ReactNode;
};

export function GlassCard({
  className,
  variant = "default",
  hoverable = false,
  children,
  ...rest
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        variant === "strong" ? "glass-strong" : "glass",
        "rounded-2xl",
        hoverable && "card-hover",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
