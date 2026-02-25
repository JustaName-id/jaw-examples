import { Account } from '@jaw.id/core';
import type { LocalAccount } from 'viem';

export async function createJawAccount(
  chainId: number,
  apiKey: string,
  localAccount: LocalAccount,
) {
  const account = await Account.fromLocalAccount(
    { chainId, apiKey },
    localAccount,
  );
  return account;
}
