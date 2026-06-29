import 'dotenv/config';
import { Account } from '@jaw.id/core';
import { privateKeyToAccount } from 'viem/accounts';
import { parseEther } from 'viem';

// ---------------------------------------------------------------------------
// Configuration — all values come from .env
// ---------------------------------------------------------------------------

const JAW_API_KEY = process.env.JAW_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const PAYMASTER_URL = process.env.PAYMASTER_URL;

if (!JAW_API_KEY || !PRIVATE_KEY) {
  console.error(
    'Missing env vars. Copy .env.example to .env and fill in your values.\n' +
    '  Required: JAW_API_KEY, PRIVATE_KEY',
  );
  process.exit(1);
}

const CHAIN_ID = 84532; // Base Sepolia

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n=== EIP-7702 Node Quickstart ===\n');

  // ── Step 1: Create the EIP-7702 account ─────────────────────────────────
  //
  // The { eip7702: true } flag preserves the EOA address as the smart account
  // address. Without it, a new counterfactual address would be generated.

  console.log('Step 1 — Create EIP-7702 account');

  // Guaranteed defined by the env guard above; TS doesn't carry that narrowing
  // of module-level consts into this nested function, so assert it here.
  const signer = privateKeyToAccount(PRIVATE_KEY!);
  const account = await Account.fromLocalAccount(
    {
      chainId: CHAIN_ID,
      apiKey: JAW_API_KEY!,
      ...(PAYMASTER_URL ? { paymasterUrl: PAYMASTER_URL } : {}),
    },
    // The example's direct viem and @jaw.id/core's viem can resolve to two
    // different versions in this workspace; the LocalAccount shape is identical
    // but nominally distinct, so bridge it to the parameter type here.
    signer as Parameters<typeof Account.fromLocalAccount>[1],
    { eip7702: true },
  );

  console.log(`  EOA address     : ${signer.address}`);
  console.log(`  Account address : ${account.address}`);
  console.log(`  Same address    : ${signer.address === account.address}`);
  console.log(`  Chain           : Base Sepolia (${CHAIN_ID})\n`);

  // ── Step 2: Sign a message ──────────────────────────────────────────────
  //
  // Signing works immediately — no delegation needed.
  // The signature is ERC-7739 wrapped for on-chain verification (ERC-1271).

  console.log('Step 2 — Sign a message');

  const message = 'Hello from EIP-7702!';
  const signature = await account.signMessage(message);

  console.log(`  message   : "${message}"`);
  console.log(`  signature : ${signature.slice(0, 40)}...\n`);

  // ── Step 3: Send a transaction ──────────────────────────────────────────
  //
  // The first sendCalls triggers EIP-7702 delegation automatically:
  //   1. Signs an authorization to delegate the EOA to the smart account implementation
  //   2. Registers the permissions manager as an owner
  //   3. Executes your actual call
  // All in a single UserOperation — the developer doesn't need to handle any of this.
  //
  // Subsequent calls skip the delegation (already done) and just send.

  console.log('Step 3 — Send transaction (triggers delegation on first call)');

  const { id } = await account.sendCalls([
    { to: account.address, value: parseEther('0.0001') },
  ]);

  console.log(`  userOp hash : ${id}`);
  process.stdout.write('  waiting     : ');

  for (;;) {
    const status = await account.getCallStatus(id);
    if (status && status.status !== 100) {
      const label = status.status === 200 ? 'confirmed' : `failed (code ${status.status})`;
      console.log(label);
      break;
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 1000));
  }

  // ── Step 4: Second call — no delegation overhead ────────────────────────
  //
  // Delegation is already active from Step 3, so this call skips
  // authorization and just sends. You MUST still poll getCallStatus
  // after sendCalls — it returns before the transaction is mined.

  console.log('\nStep 4 — Second call (delegation already active, just sends)');

  const { id: id2 } = await account.sendCalls([
    { to: account.address, value: parseEther('0.0001') },
  ]);

  console.log(`  userOp hash : ${id2}`);
  process.stdout.write('  waiting     : ');

  for (;;) {
    const status2 = await account.getCallStatus(id2);
    if (status2 && status2.status !== 100) {
      const label = status2.status === 200 ? 'confirmed' : `failed (code ${status2.status})`;
      console.log(label);
      break;
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('\n✓ All steps complete.\n');
}

main().catch((err) => {
  console.error('\n✗', err instanceof Error ? err.message : err);
  process.exit(1);
});
