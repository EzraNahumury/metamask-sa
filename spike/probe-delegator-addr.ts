import { DELEGATOR_CONTRACTS } from "@metamask/delegation-deployments";

const TARGET_CHAIN = 8453;

console.log("All known versions:", Object.keys(DELEGATOR_CONTRACTS));
console.log();

for (const [version, perChain] of Object.entries(DELEGATOR_CONTRACTS)) {
  const forChain = perChain[TARGET_CHAIN];
  if (!forChain) continue;
  console.log(`version ${version} on chain ${TARGET_CHAIN}:`);
  for (const [name, addr] of Object.entries(forChain)) {
    console.log(`  ${name.padEnd(36)} ${addr}`);
  }
  console.log();
}
