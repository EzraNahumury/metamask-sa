import { DELEGATOR_CONTRACTS } from "@metamask/delegation-deployments";
import { BASE_CHAIN_ID } from "./base.js";

/** Native USDC on Base (Circle, 6 decimals). */
export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

/** Native USDT on Base (6 decimals). */
export const USDT_BASE = "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2" as const;

/** Venice's x402 receiver wallet on Base (returned by /x402/top-up). */
export const VENICE_X402_PAY_TO = "0x2670b922ef37c7df47158725c0cc407b5382293f" as const;

/** Default delegation framework deployment we pin. */
export const DELEGATION_FRAMEWORK_VERSION = "1.3.0" as const;

/**
 * Resolve a deployed contract from the canonical delegation framework
 * registry. Throws if the name isn't deployed on Base at our pinned
 * version, which means we picked the wrong deployment string.
 */
export function getBaseContract(
  name:
    | "EIP7702StatelessDeleGatorImpl"
    | "DelegationManager"
    | "ERC20PeriodTransferEnforcer"
    | "ERC20TransferAmountEnforcer"
    | "AllowedTargetsEnforcer"
    | "AllowedMethodsEnforcer"
    | "AllowedCalldataEnforcer"
    | "ValueLteEnforcer"
    | "TimestampEnforcer"
    | "NonceEnforcer",
): `0x${string}` {
  const addr = DELEGATOR_CONTRACTS[DELEGATION_FRAMEWORK_VERSION]?.[BASE_CHAIN_ID]?.[name] as
    | `0x${string}`
    | undefined;
  if (!addr) {
    throw new Error(
      `Contract ${name} not deployed at delegation-framework ${DELEGATION_FRAMEWORK_VERSION} on Base.`,
    );
  }
  return addr;
}
