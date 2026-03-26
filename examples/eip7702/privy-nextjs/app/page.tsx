'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  usePrivy,
  useWallets,
  useCreateWallet,
  toViemAccount,
  getEmbeddedConnectedWallet,
} from '@privy-io/react-auth';
import { parseEther, type LocalAccount } from 'viem';
import { Account } from '@jaw.id/core';
import { Providers } from './providers';

const JAW_API_KEY = process.env.NEXT_PUBLIC_JAW_API_KEY || '';
const CHAIN_ID = 84532; // Base Sepolia

// ---------------------------------------------------------------------------
// Main content — lives inside PrivyProvider
// ---------------------------------------------------------------------------

function Content() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // Auto-create embedded wallet if the user doesn't have one
  useEffect(() => {
    if (authenticated && walletsReady && wallets.length === 0) {
      createWallet().catch(console.error);
    }
  }, [authenticated, walletsReady, wallets.length, createWallet]);

  // ── Step 1: Get LocalAccount from Privy + create JAW EIP-7702 account ───

  const initAccount = useCallback(async () => {
    const embeddedWallet = getEmbeddedConnectedWallet(wallets);
    if (!embeddedWallet) {
      addLog('No embedded wallet found');
      return;
    }

    setLoading(true);
    try {
      // toViemAccount converts Privy's embedded wallet into a viem LocalAccount
      const localAccount = await toViemAccount({ wallet: embeddedWallet });

      addLog(`Privy wallet: ${localAccount.address}`);
      addLog(`Has signAuthorization: ${typeof localAccount.signAuthorization === 'function'}`);

      // { eip7702: true } preserves the EOA address as the smart account address
      const acc = await Account.fromLocalAccount(
        { chainId: CHAIN_ID, apiKey: JAW_API_KEY },
        localAccount as unknown as LocalAccount,
        { eip7702: true },
      );

      setAccount(acc);
      addLog(`JAW account ready: ${acc.address} (same as EOA)`);
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [wallets]);

  // Auto-init when wallet becomes available
  useEffect(() => {
    if (authenticated && walletsReady && wallets.length > 0 && !account) {
      initAccount();
    }
  }, [authenticated, walletsReady, wallets, account, initAccount]);

  // ── Step 2: Sign a message ──────────────────────────────────────────────

  const handleSign = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const sig = await account.signMessage('Hello from EIP-7702 + Privy!');
      addLog(`Signature: ${sig.slice(0, 40)}...`);
    } catch (err) {
      addLog(`Sign failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Send a transaction ──────────────────────────────────────────

  const handleSend = async () => {
    if (!account) return;
    setLoading(true);
    try {
      addLog('Sending 0.0001 ETH to self...');
      const { id } = await account.sendCalls([
        { to: account.address, value: parseEther('0.0001') },
      ]);
      addLog(`UserOp hash: ${id}`);
    } catch (err) {
      addLog(`Send failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (!ready) return <p>Loading Privy...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'system-ui' }}>
      <h1>EIP-7702 + Privy</h1>
      <p style={{ color: '#666' }}>
        Upgrade a Privy embedded wallet to a JAW smart account while keeping the same address.
      </p>

      {!authenticated ? (
        <button onClick={login} style={btnStyle}>Login with Privy</button>
      ) : (
        <div>
          {account && (
            <div style={{ margin: '1rem 0', padding: '1rem', background: '#f5f5f5', borderRadius: 8 }}>
              <strong>Account:</strong> <code>{account.address}</code>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '1rem 0' }}>
            <button onClick={handleSign} disabled={!account || loading} style={btnStyle}>
              Sign Message
            </button>
            <button onClick={handleSend} disabled={!account || loading} style={btnStyle}>
              Send 0.0001 ETH
            </button>
            <button onClick={() => { logout(); setAccount(null); setLog([]); }} style={{ ...btnStyle, background: '#eee', color: '#333' }}>
              Logout
            </button>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <pre style={{ background: '#1a1a1a', color: '#0f0', padding: '1rem', borderRadius: 8, fontSize: 12, maxHeight: 300, overflow: 'auto' }}>
          {log.join('\n')}
        </pre>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
};

// ---------------------------------------------------------------------------
// Page — wraps content in PrivyProvider
// ---------------------------------------------------------------------------

export default function Page() {
  return (
    <Providers>
      <Content />
    </Providers>
  );
}
