"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

/**
 * Inline text + copy-to-clipboard button. Briefly flips to a check icon
 * after a successful copy. Use for addresses, tx hashes, paymentIds.
 */
export function Copyable({
  value,
  label,
  className,
  monospace = true,
}: {
  value: string;
  label?: React.ReactNode;
  className?: string;
  monospace?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "group inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-colors",
        monospace && "font-mono",
        className,
      )}
      title="Copy to clipboard"
    >
      <span>{label ?? value}</span>
      <motion.span
        key={copied ? "check" : "copy"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.16 }}
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-md transition-colors",
          copied ? "text-emerald-400" : "text-zinc-600 group-hover:text-zinc-300",
        )}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </motion.span>
    </button>
  );
}
