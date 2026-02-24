import 'dotenv/config';
import { Account } from '@jaw.id/core';
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, formatEther, http, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const JAW_API_KEY = process.env.JAW_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const RECIPIENT = process.env.RECIPIENT_ADDRESS as `0x${string}` | undefined;
const PAYMASTER_URL = process.env.PAYMASTER_URL;

if (!JAW_API_KEY || !PRIVATE_KEY || !RECIPIENT) {
  console.error(
    'Missing env vars. Copy .env.example to .env and fill in your values.\n' +
    '  Required: JAW_API_KEY, PRIVATE_KEY, RECIPIENT_ADDRESS',
  );
  process.exit(1);
}

const CHAIN_ID = 84532; // Base Sepolia

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n=== JAW Node Quickstart ===\n');

  // ── Step 1: Create the account ────────────────────────────────────────────
  //
  // Account.fromLocalAccount is the server-side entry point.
  // It wraps a private key as a smart account signer — no passkey or browser required.

  console.log('Step 1 — Create account');

  const signer = privateKeyToAccount(PRIVATE_KEY!);
  const account = await Account.fromLocalAccount(
    {
      chainId: CHAIN_ID,
      apiKey: JAW_API_KEY!,
      ...(PAYMASTER_URL ? { paymasterUrl: PAYMASTER_URL } : {}),
    },
    signer,
  );

  const client = createPublicClient({ chain: baseSepolia, transport: http() });
  const balance = await client.getBalance({ address: account.address });

  console.log(`  address : ${account.address}`);
  console.log(`  balance : ${formatEther(balance)} ETH`);
  console.log(`  chain   : Base Sepolia (${CHAIN_ID})`);
  console.log(`  paymaster: ${PAYMASTER_URL ? 'enabled' : 'none (account needs ETH)'}\n`);

  // ── Step 2: Sign a message ────────────────────────────────────────────────
  //
  // signMessage produces an EIP-191 personal signature.
  // Useful for auth challenges, off-chain proofs, and SIWE flows.
  // No ETH balance needed — signing is off-chain.

  console.log('Step 2 — Sign a message');

  const message = 'Hello from JAW!';
  const signature = await account.signMessage(message);

  console.log(`  message   : "${message}"`);
  console.log(`  signature : ${signature}\n`);

  // ── Step 3: Send ETH ─────────────────────────────────────────────────────
  //
  // sendTransaction submits a single call and waits until it is confirmed on-chain.
  // Returns the transaction hash once mined.
  //
  // The account must either hold ETH for gas, or have PAYMASTER_URL set in .env
  // to sponsor fees via a paymaster (Pimlico, Etherspot, etc.).

  console.log('Step 3 — Send ETH (single, waits for confirmation)');

  const singleAmount = parseEther('0.0001');
  const txHash = await account.sendTransaction([
    { to: RECIPIENT!, value: singleAmount },
  ]);

  console.log(`  to     : ${RECIPIENT}`);
  console.log(`  amount : ${formatEther(singleAmount)} ETH`);
  console.log(`  hash   : ${txHash}\n`);

  // ── Step 4: Batch send ────────────────────────────────────────────────────
  //
  // sendCalls bundles multiple calls into one user operation:
  // one gas payment, atomic execution — either all succeed or all fail.
  // It returns immediately with a batch ID; the tx mines in the background.

  console.log('Step 4 — Batch send (two transfers, one user op)');

  const { id: batchId } = await account.sendCalls([
    { to: RECIPIENT!, value: parseEther('0.00005') },
    { to: RECIPIENT!, value: parseEther('0.00005') },
  ]);

  console.log(`  batch ID : ${batchId}`);
  process.stdout.write('  waiting  : ');

  for (;;) {
    const callStatus = account.getCallStatus(batchId);
    // 100 Pending | 200 Confirmed | 400 Offchain failure | 500 Onchain revert
    if (callStatus && callStatus.status !== 100) {
      const label = callStatus.status === 200
        ? 'confirmed'
        : `failed (code ${callStatus.status})`;
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
