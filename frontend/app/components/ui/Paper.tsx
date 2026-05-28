"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

type Props = Omit<HTMLMotionProps<"div">, "ref" | "children"> & {
  variant?: "default" | "thick";
  liftable?: boolean;
  children?: React.ReactNode;
};

export function Paper({
  className,
  variant = "default",
  liftable = false,
  children,
  ...rest
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        variant === "thick" ? "paper-thick" : "paper",
        "rounded-2xl",
        liftable && "lift",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
