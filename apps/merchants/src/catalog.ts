import { USDC_BASE } from "@delegate/core";

export type MerchantService = {
  /** URL slug, e.g. "netflix-mock". */
  slug: string;
  /** Human-readable name, used in receipts and decision logs. */
  displayName: string;
  /** Normal monthly price in USDC, micro-units (6 decimals). */
  normalPriceMicroUsdc: bigint;
  /** Override price for the next quote (used by the anomaly trigger). */
  anomalyPriceMicroUsdc?: bigint;
  /** USDC token contract this service charges in. */
  asset: `0x${string}`;
};

export const catalog: MerchantService[] = [
  { slug: "netflix-mock",  displayName: "Netflix-mock",  normalPriceMicroUsdc: 15_990_000n, asset: USDC_BASE },
  { slug: "spotify-mock",  displayName: "Spotify-mock",  normalPriceMicroUsdc:  9_990_000n, asset: USDC_BASE },
  { slug: "substack-mock", displayName: "Substack-mock", normalPriceMicroUsdc:  7_500_000n, asset: USDC_BASE },
  { slug: "domain-mock",   displayName: "Domain-mock",   normalPriceMicroUsdc: 12_000_000n, asset: USDC_BASE },
  { slug: "chatgpt-mock",  displayName: "ChatGPT-mock",  normalPriceMicroUsdc: 20_000_000n, asset: USDC_BASE },
];

export function getServiceOr404(slug: string): MerchantService | undefined {
  return catalog.find((s) => s.slug === slug);
}
