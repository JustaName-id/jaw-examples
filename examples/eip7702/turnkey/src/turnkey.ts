import { Turnkey } from '@turnkey/sdk-server';
import { createAccount } from '@turnkey/viem';

export function initTurnkey(
  organizationId: string,
  apiPublicKey: string,
  apiPrivateKey: string,
) {
  return new Turnkey({
    defaultOrganizationId: organizationId,
    apiBaseUrl: 'https://api.turnkey.com',
    apiPublicKey,
    apiPrivateKey,
  });
}

export async function createWallet(turnkey: Turnkey) {
  const apiClient = turnkey.apiClient();
  const response = await apiClient.createWallet({
    walletName: `jaw-7702-${Date.now()}`,
    accounts: [
      {
        curve: 'CURVE_SECP256K1',
        pathFormat: 'PATH_FORMAT_BIP32',
        path: "m/44'/60'/0'/0/0",
        addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
      },
    ],
  });

  return { walletId: response.walletId, address: response.addresses[0] };
}

export async function getWallets(turnkey: Turnkey) {
  const apiClient = turnkey.apiClient();
  const response = await apiClient.getWallets();
  return response.wallets;
}

export async function getWalletAccounts(turnkey: Turnkey, walletId: string) {
  const apiClient = turnkey.apiClient();
  const response = await apiClient.getWalletAccounts({ walletId });
  return response.accounts;
}

export async function getViemAccount(
  turnkey: Turnkey,
  organizationId: string,
  address: string,
) {
  return await createAccount({
    client: turnkey.apiClient(),
    organizationId,
    signWith: address,
    ethereumAddress: address as `0x${string}`,
  });
}
