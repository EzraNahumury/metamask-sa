import { encodeFunctionData, type Account, type PublicClient } from "viem";
import {
  Implementation,
  createDelegation,
  toMetaMaskSmartAccount,
} from "@metamask/smart-accounts-kit";
import { base, BASE_CHAIN_ID, getBaseContract, USDC_BASE } from "../chain/index.js";
import type { OneShotRelayerClient } from "./relayer.js";
import type { AuthorizationEntry } from "./types.js";

const ERC20_TRANSFER_ABI = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

export type SettleResult = {
  txHash: string;
  /** True when the call also performed an in-flight 7702 upgrade. */
  includedUpgrade: boolean;
  /** Amount transferred to recipient, in micro-USDC. */
  amountMicroUsdc: bigint;
};

/**
 * Settle a single x402 payment onchain via the 1Shot permissionless relayer.
 * The EOA's smart account delegates a USDC transfer to 1Shot's targetAddress;
 * 1Shot redeems the delegation, transfers USDC to the recipient, and takes
 * its fee.
 *
 * If the EOA has no code yet, the call includes an EIP-7702 authorization
 * to upgrade in-flight (one tx, no separate setup transaction).
 */
export async function settleOnchain(params: {
  publicClient: PublicClient;
  account: Pick<Account, "address" | "signAuthorization" | "signTypedData" | "signMessage">;
  relayer: OneShotRelayerClient;
  recipient: `0x${string}`;
  amountMicroUsdc: bigint;
  /** Multiplier for the delegation cap vs (fee + work). Default 2x. */
  capMultiplier?: bigint;
}): Promise<SettleResult> {
  const { publicClient, account, relayer, recipient, amountMicroUsdc } = params;

  // 1. Fee quote (short-lived; re-quote per submission).
  const fee = await relayer.getFeeData(BASE_CHAIN_ID, USDC_BASE);
  // The relayer's `minFee` is a decimal-USD string (e.g. "0.01"); convert to
  // micro-USDC with a small safety bump so a fresh re-quote at broadcast
  // doesn't kick us out.
  const feeFloat = Number(fee.minFee);
  const feeMicroUsdc = BigInt(Math.ceil(feeFloat * 1.5 * 10 ** fee.token.decimals));

  // 2. Smart-account view of the signer.
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Stateless7702,
    address: account.address as `0x${string}`,
    signer: { account: account as Account },
  });

  // 3. Optional 7702 upgrade if the EOA doesn't carry delegator code yet.
  let authorizationList: AuthorizationEntry[] | undefined;
  const code = await publicClient.getCode({ address: account.address });
  let includedUpgrade = false;
  if (!code || code === "0x") {
    if (!account.signAuthorization) {
      throw new Error("Account cannot sign EIP-7702 authorizations; cannot upgrade in-flight.");
    }
    const implAddress = getBaseContract("EIP7702StatelessDeleGatorImpl");
    const nonce = await publicClient.getTransactionCount({ address: account.address });
    const auth = await account.signAuthorization({
      chainId: base.id,
      contractAddress: implAddress,
      nonce,
    });
    authorizationList = [auth as unknown as AuthorizationEntry];
    includedUpgrade = true;
  }

  // 4. Build, sign, and encode the delegation. The cap must cover both the
  // 1Shot fee transfer and the work transfer that follow.
  const totalToCover = feeMicroUsdc + amountMicroUsdc;
  const cap = totalToCover * (params.capMultiplier ?? 2n);
  const delegation = createDelegation({
    environment: smartAccount.environment,
    from: smartAccount.address,
    to: fee.targetAddress,
    scope: {
      type: "erc20TransferAmount",
      tokenAddress: USDC_BASE,
      maxAmount: cap,
    },
  });
  const signature = await smartAccount.signDelegation({ delegation });
  const signedDelegation = { ...delegation, signature };

  // 5. Two executions in batch: pay the 1Shot fee, then the actual work.
  const feeData = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [fee.feeCollector, feeMicroUsdc],
  });
  const workData = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [recipient, amountMicroUsdc],
  });

  // 6. Submit to 1Shot.
  const result = await relayer.send7710Transaction({
    chainId: String(base.id),
    context: fee.context,
    ...(authorizationList ? { authorizationList } : {}),
    transactions: [
      {
        permissionContext: [signedDelegation],
        executions: [
          { target: USDC_BASE, value: "0", data: feeData },
          { target: USDC_BASE, value: "0", data: workData },
        ],
      },
    ],
  });

  const txHash =
    typeof result === "string" ? result : result.txHash ?? result.id ?? "<no hash>";
  return { txHash, includedUpgrade, amountMicroUsdc };
}
