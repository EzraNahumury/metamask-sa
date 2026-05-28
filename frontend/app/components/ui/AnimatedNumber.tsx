"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function AnimatedNumber({
  value,
  formatter,
}: {
  value: number;
  formatter?: (n: number) => string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 18, mass: 0.6 });
  const display = useTransform(spring, (n) =>
    formatter ? formatter(n) : Math.round(n).toString(),
  );

  useEffect(() => {
    mv.set(value);
  }, [mv, value]);

  return <motion.span className="tabular-nums">{display}</motion.span>;
}
