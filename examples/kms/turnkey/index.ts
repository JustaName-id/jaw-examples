import * as readline from 'readline';
import { parseEther } from 'viem';
import type { Account } from '@jaw.id/core';

import { CHAIN_ID, getEnv } from './src/config.js';
import { initTurnkey, createWallet, getWallets, getWalletAccounts, getViemAccount } from './src/turnkey.js';
import { createJawAccount } from './src/jaw.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((res) => rl.question(q, res));

async function setup() {
  const env = getEnv();
  const turnkey = initTurnkey(env.turnkeyOrgId, env.turnkeyApiPublicKey, env.turnkeyApiPrivateKey);

  console.log('\n--- Turnkey + JAW Server Wallet ---\n');

  const choice = await ask('  [1] Create new wallet\n  [2] Load existing wallet\n\n  Choice: ');

  let walletAddress: string;

  if (choice.trim() === '2') {
    const wallets = await getWallets(turnkey);

    if (wallets.length === 0) {
      console.log('\n  No wallets found. Creating a new one...');
      const wallet = await createWallet(turnkey);
      walletAddress = wallet.address;
      console.log(`  Wallet ID: ${wallet.walletId}`);
    } else {
      console.log('\n  Available wallets:');
      for (let i = 0; i < wallets.length; i++) {
        console.log(`    [${i + 1}] ${wallets[i].walletName} (${wallets[i].walletId})`);
      }
      const walletChoice = await ask('\n  Select wallet number: ');
      const idx = parseInt(walletChoice.trim(), 10) - 1;
      const selectedWallet = wallets[idx] || wallets[0];

      const accounts = await getWalletAccounts(turnkey, selectedWallet.walletId);
      walletAddress = accounts[0].address;
      console.log(`\n  Loaded wallet: ${selectedWallet.walletName}`);
    }
  } else {
    console.log('\n  Creating new Turnkey wallet...');
    const wallet = await createWallet(turnkey);
    walletAddress = wallet.address;
    console.log(`  Wallet ID: ${wallet.walletId}`);
  }

  console.log(`  Address:   ${walletAddress}`);

  console.log('\n  Creating viem account...');
  const localAccount = await getViemAccount(turnkey, env.turnkeyOrgId, walletAddress);

  console.log('  Creating JAW smart account...');
  const account = await createJawAccount(CHAIN_ID, env.jawApiKey, localAccount);
  console.log(`  Smart Account: ${account.address}`);
  console.log(`  Chain ID:      ${account.chainId}\n`);

  return account;
}

async function signMessage(account: Account) {
  const msg = await ask('  Message to sign: ');
  const signature = await account.signMessage(msg);
  console.log(`  Signature: ${signature}\n`);
}

async function sendTransaction(account: Account) {
  const to = await ask('  Recipient address (blank = self): ');
  const amountStr = await ask('  Amount in ETH: ');
  const recipient = to.trim() || account.address;
  const amount = parseEther(amountStr.trim());

  console.log(`  Sending ${amountStr.trim()} ETH to ${recipient}...`);
  try {
    const txHash = await account.sendTransaction([
      { to: recipient as `0x${string}`, value: amount, data: '0x' },
    ]);
    console.log(`  Tx hash:  ${txHash}`);
    console.log(`  Explorer: https://sepolia.basescan.org/tx/${txHash}\n`);
  } catch (err) {
    console.log(`  Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    console.log(`  Fund the account: ${account.address}`);
    console.log(`  Faucet: https://www.alchemy.com/faucets/base-sepolia\n`);
  }
}

function showInfo(account: Account) {
  console.log(`  Address:  ${account.address}`);
  console.log(`  Chain ID: ${account.chainId}\n`);
}

async function menu(account: Account) {
  while (true) {
    console.log('  [1] Sign a message');
    console.log('  [2] Send transaction');
    console.log('  [3] Account info');
    console.log('  [4] Exit\n');

    const choice = await ask('  > ');

    switch (choice.trim()) {
      case '1':
        await signMessage(account);
        break;
      case '2':
        await sendTransaction(account);
        break;
      case '3':
        showInfo(account);
        break;
      case '4':
        console.log('  Bye.');
        rl.close();
        return;
      default:
        console.log('  Invalid choice.\n');
    }
  }
}

async function main() {
  const account = await setup();
  await menu(account);
}

main().catch((err) => {
  console.error(err);
  rl.close();
});
