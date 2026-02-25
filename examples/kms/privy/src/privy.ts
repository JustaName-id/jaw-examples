import { PrivyClient } from '@privy-io/server-auth';
import { createViemAccount } from '@privy-io/server-auth/viem';

export function initPrivy(appId: string, appSecret: string) {
  return new PrivyClient(appId, appSecret);
}

export async function createServerWallet(privy: PrivyClient) {
  const wallet = await privy.walletApi.create({ chainType: 'ethereum' });
  return wallet;
}

export async function loadWallet(privy: PrivyClient, walletId: string) {
  const wallet = await privy.walletApi.getWallet({ id: walletId });
  return wallet;
}

export async function getViemAccount(privy: PrivyClient, walletId: string, address: string) {
  const localAccount = await createViemAccount({
    walletId,
    address: address as `0x${string}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    privy: privy as any,
  });
  return localAccount;
}
