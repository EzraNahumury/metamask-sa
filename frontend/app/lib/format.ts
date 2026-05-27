export function formatMicroUsdc(micro: string | bigint): string {
  const n = typeof micro === "bigint" ? Number(micro) : Number(BigInt(micro));
  return `$${(n / 1e6).toFixed(2)}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function shortAddr(addr?: string | null, head = 6, tail = 4): string {
  if (!addr) return "—";
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
