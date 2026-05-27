import type { Hex } from "viem";

/**
 * Authorization list entry — viem's `signAuthorization` output, BigInts
 * already serialised to strings by the JSON layer.
 */
export type AuthorizationEntry = {
  address: `0x${string}`;
  chainId: number | string;
  nonce: number | string;
  r: Hex;
  s: Hex;
  v?: number | string;
  yParity: 0 | 1 | string;
};

/** Plain signed delegation as the 1Shot relayer expects it (not hex). */
export type SignedDelegation = {
  delegate: `0x${string}`;
  delegator: `0x${string}`;
  authority: string;
  caveats: Array<{ enforcer: `0x${string}`; terms: string; args: string }>;
  salt: string;
  signature: Hex;
};

export type ExecutionEntry = {
  target: `0x${string}`;
  value: string;
  data: Hex;
};

export type DelegatedTransaction = {
  permissionContext: SignedDelegation[];
  executions: ExecutionEntry[];
};

export type Send7710Params = {
  chainId: string;
  context?: string;
  destinationUrl?: string;
  taskId?: Hex;
  transactions: DelegatedTransaction[];
  authorizationList?: AuthorizationEntry[];
};

export type FeeQuote = {
  chainId: string;
  token: { decimals: number; address: string; symbol: string; name: string };
  rate: number;
  minFee: string;
  expiry: number;
  gasPrice: string;
  feeCollector: `0x${string}`;
  targetAddress: `0x${string}`;
  /** Opaque JSON-string blob; must be passed back to `send7710Transaction` as `context`. */
  context: string;
};

export type ChainCapabilities = {
  feeCollector: `0x${string}`;
  targetAddress: `0x${string}`;
  tokens: Array<{ address: `0x${string}`; symbol: string; decimals: string }>;
};
