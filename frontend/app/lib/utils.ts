import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Coerce any thrown value into a useful display string. Prevents the
 * dreaded "[object Object]" that String(err) gives for plain objects.
 */
export function formatError(err: unknown): string {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const maybe = err as { message?: unknown; shortMessage?: unknown; reason?: unknown };
    if (typeof maybe.shortMessage === "string") return maybe.shortMessage;
    if (typeof maybe.message === "string") return maybe.message;
    if (typeof maybe.reason === "string") return maybe.reason;
    try {
      return JSON.stringify(err).slice(0, 280);
    } catch {
      return "Unknown error";
    }
  }
  return String(err);
}
