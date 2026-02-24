'use client';

import { useState, useEffect } from 'react';
import { PrivyProvider, usePrivy, useWallets, toViemAccount } from '@privy-io/react-auth';
import { Account } from '@jaw.id/core';
import { parseEther, isAddress, toHex, type Hex } from 'viem';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const JAW_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const CHAIN_ID = 84532; // Base Sepolia

function PrivyJAWDemo() {
  const { login, logout, authenticated, user, ready, createWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const [jawAccount, setJawAccount] = useState<Account | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingWallet, setCreatingWallet] = useState(false);

  // Per-card state: Sign Message
  const [signMsg, setSignMsg] = useState('');
  const [signResult, setSignResult] = useState<string | null>(null);
  const [signLoading, setSignLoading] = useState(false);

  // Per-card state: Send Transaction
  const [txTo, setTxTo] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txResult, setTxResult] = useState<string | null>(null);
  const [txLoading, setTxLoading] = useState(false);

  // Per-card state: Grant Permission
  const [grantSpender, setGrantSpender] = useState('');
  const [grantExpiry, setGrantExpiry] = useState('86400');
  const [grantTarget, setGrantTarget] = useState('');
  const [grantFnSig, setGrantFnSig] = useState('');
  const [grantToken, setGrantToken] = useState('');
  const [grantAllowance, setGrantAllowance] = useState('');
  const [grantPeriod, setGrantPeriod] = useState<'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'forever'>('day');
  const [grantResult, setGrantResult] = useState<string | null>(null);
  const [grantLoading, setGrantLoading] = useState(false);

  // Per-card state: Revoke Permission
  const [revokeId, setRevokeId] = useState('');
  const [revokeResult, setRevokeResult] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  // Find the Privy embedded wallet
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

  // Create embedded wallet if user is authenticated but doesn't have one
  useEffect(() => {
    const createEmbeddedWallet = async () => {
      if (authenticated && walletsReady && !embeddedWallet && !creatingWallet) {
        setCreatingWallet(true);
        try {
          await createWallet();
        } catch (err) {
          console.error('Failed to create wallet:', err);
        } finally {
          setCreatingWallet(false);
        }
      }
    };
    createEmbeddedWallet();
  }, [authenticated, walletsReady, embeddedWallet, creatingWallet, createWallet]);

  // Initialize JAW Account from Privy wallet
  const initJAWAccount = async () => {
    if (!embeddedWallet) {
      setError('No embedded wallet found. Please login first.');
      return;
    }

    setAccountLoading(true);
    setError(null);

    try {
      // Get base account structure from toViemAccount (address, publicKey, type, source, sign)
      const baseAccount = await toViemAccount({ wallet: embeddedWallet });

      // Get EIP-1193 provider — signing through this triggers Privy's confirmation modal
      const provider = await embeddedWallet.getEthereumProvider();

      // NOTE: Privy's toViemAccount() signs silently (no confirmation UI).
      // To show Privy's confirmation modal, we override sign methods to route
      // through the EIP-1193 provider instead. JAW calls owner.sign() for
      // messages and owner.signTypedData() for UserOps — both hit the provider.
      const localAccount = {
        ...baseAccount,

        async sign({ hash }: { hash: Hex }): Promise<Hex> {
          return provider.request({
            method: 'personal_sign',
            params: [hash, embeddedWallet.address],
          }) as Promise<Hex>;
        },

        async signMessage({ message }: { message: string | { raw: Hex | Uint8Array } }): Promise<Hex> {
          const msg: Hex = typeof message === 'string'
            ? toHex(message)
            : typeof message.raw === 'string'
              ? message.raw
              : toHex(message.raw);

          return provider.request({
            method: 'personal_sign',
            params: [msg, embeddedWallet.address],
          }) as Promise<Hex>;
        },

        async signTypedData(typedData: Record<string, unknown>): Promise<Hex> {
          return provider.request({
            method: 'eth_signTypedData_v4',
            params: [embeddedWallet.address, JSON.stringify(typedData)],
          }) as Promise<Hex>;
        },
      };

      // Create JAW Account from the provider-backed account
      const account = await Account.fromLocalAccount(
        { chainId: CHAIN_ID, apiKey: JAW_API_KEY },
        localAccount
      );

      setJawAccount(account);
      console.log('JAW Smart Account created:', account.address);
    } catch (err) {
      console.error('Failed to create JAW account:', err);
      setError(err instanceof Error ? err.message : 'Failed to create JAW account');
    } finally {
      setAccountLoading(false);
    }
  };

  // --- Handlers ---

  const handleSignMessage = async () => {
    if (!jawAccount || !signMsg.trim()) return;
    setSignLoading(true);
    setSignResult(null);
    setError(null);
    try {
      const sig = await jawAccount.signMessage(signMsg);
      setSignResult(sig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign message');
    } finally {
      setSignLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!jawAccount || !txTo || !txAmount) return;
    if (!isAddress(txTo)) { setError('Invalid recipient address'); return; }
    setTxLoading(true);
    setTxResult(null);
    setError(null);
    try {
      const hash = await jawAccount.sendTransaction([{
        to: txTo as `0x${string}`,
        value: parseEther(txAmount),
        data: '0x',
      }]);
      setTxResult(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    } finally {
      setTxLoading(false);
    }
  };

  const handleGrantPermission = async () => {
    if (!jawAccount || !grantSpender) return;
    if (!isAddress(grantSpender)) { setError('Invalid spender address'); return; }
    setGrantLoading(true);
    setGrantResult(null);
    setError(null);
    try {
      const expiry = Math.floor(Date.now() / 1000) + Number(grantExpiry);

      const permissions: {
        calls?: { target: `0x${string}`; selector?: Hex; functionSignature?: string }[];
        spends?: { token: `0x${string}`; allowance: string; unit: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'forever'; multiplier: number }[];
      } = {};

      if (grantTarget && isAddress(grantTarget)) {
        // Detect if input is a 4-byte hex selector (0x + 8 hex chars) or a human-readable signature
        const isSelector = grantFnSig && /^0x[0-9a-fA-F]{8}$/.test(grantFnSig);
        permissions.calls = [{
          target: grantTarget as `0x${string}`,
          ...(isSelector
            ? { selector: grantFnSig as Hex }
            : grantFnSig ? { functionSignature: grantFnSig } : {}),
        }];
      }

      if (grantToken && grantAllowance) {
        const tokenAddr = grantToken.toLowerCase() === 'eth'
          ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
          : grantToken;
        if (tokenAddr !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' && !isAddress(tokenAddr)) {
          setError('Invalid token address');
          setGrantLoading(false);
          return;
        }
        permissions.spends = [{
          token: tokenAddr as `0x${string}`,
          allowance: toHex(parseEther(grantAllowance)),
          unit: grantPeriod,
          multiplier: 1,
        }];
      }

      const result = await jawAccount.grantPermissions(
        expiry,
        grantSpender as `0x${string}`,
        permissions,
      );
      setGrantResult(result.permissionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant permission');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleRevokePermission = async () => {
    if (!jawAccount || !revokeId) return;
    setRevokeLoading(true);
    setRevokeResult(null);
    setError(null);
    try {
      await jawAccount.revokePermission(revokeId as Hex);
      setRevokeResult('Permission revoked successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke permission');
    } finally {
      setRevokeLoading(false);
    }
  };

  // Auto-initialize JAW account when wallet is ready
  useEffect(() => {
    if (authenticated && walletsReady && embeddedWallet && !jawAccount && !accountLoading && !creatingWallet) {
      initJAWAccount();
    }
  }, [authenticated, walletsReady, embeddedWallet, jawAccount, accountLoading, creatingWallet]);

  // Reset state on logout
  useEffect(() => {
    if (!authenticated) {
      setJawAccount(null);
      setError(null);
      setSignMsg(''); setSignResult(null);
      setTxTo(''); setTxAmount(''); setTxResult(null);
      setGrantSpender(''); setGrantTarget(''); setGrantFnSig('');
      setGrantToken(''); setGrantAllowance(''); setGrantResult(null);
      setRevokeId(''); setRevokeResult(null);
    }
  }, [authenticated]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Privy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Privy + JAW Account Demo</h1>
        <p className="text-gray-400 mb-8">
          Using Privy embedded wallet as signer for JAW Smart Account
        </p>

        {/* Login Section */}
        {!authenticated ? (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Login with Privy</h2>
            <p className="text-gray-400 mb-4">
              Login with email or social to get an embedded wallet
            </p>
            <button
              onClick={login}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Login with Privy
            </button>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Privy User</h2>
                  <p className="text-gray-400 text-sm">
                    {user?.email?.address || user?.google?.email || user?.twitter?.username || 'Connected'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </div>

              {embeddedWallet && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Embedded Wallet (EOA Signer)</p>
                  <p className="font-mono text-sm break-all">{embeddedWallet.address}</p>
                </div>
              )}
            </div>

            {/* JAW Account Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">JAW Smart Account</h2>

              {(!walletsReady || creatingWallet) ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-gray-400">
                    {creatingWallet ? 'Creating embedded wallet...' : 'Loading wallets...'}
                  </span>
                </div>
              ) : !embeddedWallet ? (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    No embedded wallet found. Please try logging out and back in.
                  </p>
                </div>
              ) : accountLoading && !jawAccount ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-gray-400">Creating smart account...</span>
                </div>
              ) : jawAccount ? (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Smart Account Address</p>
                    <p className="font-mono text-sm break-all">{jawAccount.address}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Chain ID</p>
                    <p className="font-mono text-sm">{jawAccount.chainId} (Base Sepolia)</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={initJAWAccount}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  Create JAW Account
                </button>
              )}
            </div>

            {/* Action Cards */}
            {jawAccount && (
              <>
                {/* Sign Message Card */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Sign Message</h3>
                  <textarea
                    value={signMsg}
                    onChange={(e) => setSignMsg(e.target.value)}
                    placeholder="Enter message to sign..."
                    rows={3}
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 mb-4 resize-none"
                  />
                  <button
                    onClick={handleSignMessage}
                    disabled={signLoading || !signMsg.trim()}
                    className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    {signLoading ? 'Signing...' : 'Sign Message'}
                  </button>
                  {signResult && (
                    <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
                      <p className="text-sm text-gray-400 mb-1">Signature</p>
                      <p className="font-mono text-xs break-all text-purple-400">{signResult}</p>
                    </div>
                  )}
                </div>

                {/* Send Transaction Card */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Send Transaction</h3>
                  <input
                    type="text"
                    value={txTo}
                    onChange={(e) => setTxTo(e.target.value)}
                    placeholder="Recipient address (0x...)"
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 mb-3"
                  />
                  <input
                    type="text"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Amount in ETH (e.g. 0.001)"
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 mb-4"
                  />
                  <button
                    onClick={handleSendTransaction}
                    disabled={txLoading || !txTo || !txAmount}
                    className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    {txLoading ? 'Sending...' : 'Send Transaction'}
                  </button>
                  <p className="text-gray-500 text-xs mt-2">
                    Requires Base Sepolia ETH in your smart account.
                  </p>
                  {txResult && (
                    <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
                      <p className="text-sm text-gray-400 mb-1">Transaction Hash</p>
                      <a
                        href={`https://sepolia.basescan.org/tx/${txResult}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs break-all text-green-400 hover:underline"
                      >
                        {txResult}
                      </a>
                    </div>
                  )}
                </div>

                {/* Grant Permission Card */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Grant Permission</h3>

                  <label className="block text-sm text-gray-400 mb-1">Spender Address *</label>
                  <input
                    type="text"
                    value={grantSpender}
                    onChange={(e) => setGrantSpender(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 mb-3"
                  />

                  <label className="block text-sm text-gray-400 mb-1">Expiry *</label>
                  <select
                    value={grantExpiry}
                    onChange={(e) => setGrantExpiry(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg p-3 text-white mb-4"
                  >
                    <option value="3600">1 hour</option>
                    <option value="86400">1 day</option>
                    <option value="604800">7 days</option>
                    <option value="2592000">30 days</option>
                  </select>

                  <p className="text-sm text-gray-400 mt-2 mb-2 font-medium">Call Permission (optional)</p>
                  <input
                    type="text"
                    value={grantTarget}
                    onChange={(e) => setGrantTarget(e.target.value)}
                    placeholder="Target contract address (0x...)"
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 mb-3"
                  />
                  <input
                    type="text"
                    value={grantFnSig}
                    onChange={(e) => setGrantFnSig(e.target.value)}
                    placeholder="Selector (0xe0e0e0e0) or signature (transfer(address,uint256))"
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 mb-4"
                  />

                  <p className="text-sm text-gray-400 mt-2 mb-2 font-medium">Spend Limit (optional)</p>
                  <input
                    type="text"
                    value={grantToken}
                    onChange={(e) => setGrantToken(e.target.value)}
                    placeholder='Token address or "ETH" for native'
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 mb-3"
                  />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <input
                      type="text"
                      value={grantAllowance}
                      onChange={(e) => setGrantAllowance(e.target.value)}
                      placeholder="Allowance (e.g. 0.1)"
                      className="bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500"
                    />
                    <select
                      value={grantPeriod}
                      onChange={(e) => setGrantPeriod(e.target.value as typeof grantPeriod)}
                      className="bg-gray-700 rounded-lg p-3 text-white"
                    >
                      <option value="minute">Per Minute</option>
                      <option value="hour">Per Hour</option>
                      <option value="day">Per Day</option>
                      <option value="week">Per Week</option>
                      <option value="month">Per Month</option>
                      <option value="year">Per Year</option>
                      <option value="forever">Forever</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGrantPermission}
                    disabled={grantLoading || !grantSpender}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    {grantLoading ? 'Granting...' : 'Grant Permission'}
                  </button>

                  {grantResult && (
                    <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
                      <p className="text-sm text-gray-400 mb-1">Permission ID</p>
                      <p className="font-mono text-xs break-all text-blue-400">{grantResult}</p>
                    </div>
                  )}
                </div>

                {/* Revoke Permission Card */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Revoke Permission</h3>
                  <input
                    type="text"
                    value={revokeId}
                    onChange={(e) => setRevokeId(e.target.value)}
                    placeholder="Permission ID (0x...)"
                    className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-500 mb-4"
                  />
                  <button
                    onClick={handleRevokePermission}
                    disabled={revokeLoading || !revokeId}
                    className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    {revokeLoading ? 'Revoking...' : 'Revoke Permission'}
                  </button>
                  <p className="text-gray-500 text-xs mt-2">
                    Revocation is permanent and requires an on-chain transaction.
                  </p>
                  {revokeResult && (
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mt-4">
                      <p className="text-green-400 text-sm">{revokeResult}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Error Section */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
            <li>Privy creates an embedded wallet (EOA) when you login</li>
            <li>We wrap its EIP-1193 provider as a viem account (triggers Privy confirmation UI)</li>
            <li>JAW creates a smart account with the Privy wallet as the owner/signer via <code className="text-blue-400">Account.fromLocalAccount()</code></li>
            <li>All transactions are signed by Privy, executed by JAW smart account</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Wrap with PrivyProvider
export default function PrivyPage() {
  if (!PRIVY_APP_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Missing Privy App ID</h1>
          <p className="text-gray-400 mb-4">
            Please add <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_PRIVY_APP_ID</code> to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google', 'twitter'],
        appearance: {
          theme: 'dark',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          showWalletUIs: true,
        },
      }}
    >
      <PrivyJAWDemo />
    </PrivyProvider>
  );
}
