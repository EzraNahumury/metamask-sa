"use client";

import { motion } from "framer-motion";

/**
 * Minimal SVG sparkline. Pure path geometry — no chart lib. Accepts
 * raw numbers, normalises internally. Animates draw on mount.
 */
export function Sparkline({
  values,
  color = "#34d399",
  width = 80,
  height = 24,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth={1.2}
          strokeDasharray="2 3"
          opacity={0.4}
        />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return { x, y };
  });
  const d = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`),
    "",
  );

  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      />
      {points.length > 0 ? (
        <motion.circle
          cx={points[points.length - 1]!.x}
          cy={points[points.length - 1]!.y}
          r={2.2}
          fill={color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 }}
        />
      ) : null}
    </svg>
  );
}
