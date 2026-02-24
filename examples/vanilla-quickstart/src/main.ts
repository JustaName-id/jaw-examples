import './style.css';
import { JAW, Mode } from '@jaw.id/core';
import { toHex, parseEther } from 'viem';

// ---------------------------------------------------------------------------
// 1. Initialize JAW — one instance, shared across the whole page
// ---------------------------------------------------------------------------

const jaw = JAW.create({
  apiKey: import.meta.env.VITE_JAW_API_KEY,
  appName: 'JAW Vanilla Quickstart',
  defaultChainId: 1,
  preference: { mode: Mode.CrossPlatform },
});

// provider is EIP-1193 compatible — works like MetaMask or any other wallet
const provider = jaw.provider;

// ---------------------------------------------------------------------------
// DOM utilities
// ---------------------------------------------------------------------------

function $(id: string) {
  return document.getElementById(id)!;
}

function show(el: Element) { el.classList.remove('hidden'); }
function hide(el: Element) { el.classList.add('hidden'); }

// Render a success or error card inside a result container
function showResult(id: string, type: 'ok' | 'err', title: string, detail: string) {
  const el = $(id);
  show(el);
  if (type === 'ok') {
    el.innerHTML = `
      <div class="rounded-lg border border-green-900 bg-green-950/50 px-4 py-3">
        <p class="text-sm font-medium text-green-400">${title}</p>
        <p class="mt-1 font-mono text-xs text-green-400/80 break-all">${detail}</p>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3">
        <p class="text-sm font-medium text-red-400">${title}</p>
        <p class="mt-1 text-xs text-red-400/80 break-all">${detail}</p>
      </div>`;
  }
}

// Append a timestamped line to the event log
function log(message: string) {
  const el = $('event-log');
  if (el.querySelector('.placeholder')) el.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  el.appendChild(p);
  el.scrollTop = el.scrollHeight;
}

// EIP-1193 defines code 4001 as "user rejected the request"
function isUserRejection(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err
    && (err as { code: number }).code === 4001;
}

// ---------------------------------------------------------------------------
// 2. State — track the connected address
// ---------------------------------------------------------------------------

let connectedAddress: string | null = null;

function onConnect(address: string, chainId: number) {
  connectedAddress = address;
  $('account-address').textContent = address;
  $('account-chain').textContent = String(chainId);
  show($('account-info'));
  hide($('btn-connect'));
  show($('btn-disconnect'));
  show($('section-send'));
  show($('section-sign'));
  log(`Connected: ${address}`);
}

function onDisconnect() {
  connectedAddress = null;
  hide($('account-info'));
  hide($('btn-disconnect'));
  show($('btn-connect'));
  hide($('section-send'));
  hide($('section-sign'));
  for (const id of ['send-result', 'sign-result']) {
    $(id).innerHTML = '';
    hide($(id));
  }
  log('Disconnected');
}

// ---------------------------------------------------------------------------
// 3. Poll for bundle confirmation
//    wallet_sendCalls returns immediately with a bundle ID.
//    Poll wallet_getCallsStatus until it leaves the Pending (100) state.
// ---------------------------------------------------------------------------

async function waitForBundle(bundleId: string): Promise<number> {
  for (;;) {
    const { status } = await provider.request({
      method: 'wallet_getCallsStatus',
      params: [bundleId],
    }) as { status: number };
    // 100 Pending | 200 Confirmed | 400 Offchain failure | 500 Onchain revert
    if (status !== 100) return status;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// ---------------------------------------------------------------------------
// Connect — wallet_connect opens the passkey prompt
// ---------------------------------------------------------------------------

$('btn-connect').addEventListener('click', async () => {
  const btn = $('btn-connect') as HTMLButtonElement;
  btn.textContent = 'Connecting…';
  btn.disabled = true;

  try {
    const { accounts } = await provider.request({
      method: 'wallet_connect',
      params: [{}],
    }) as { accounts: { address: string }[] };

    if (accounts[0]) {
      const chainHex = await provider.request({ method: 'eth_chainId' }) as string;
      onConnect(accounts[0].address, parseInt(chainHex, 16));
    }
  } catch (err) {
    if (isUserRejection(err)) {
      log('Connect cancelled');
    } else {
      log(`Connect error: ${err instanceof Error ? err.message : String(err)}`);
    }
  } finally {
    btn.textContent = 'Connect Wallet';
    btn.disabled = false;
  }
});

// ---------------------------------------------------------------------------
// Disconnect
// ---------------------------------------------------------------------------

$('btn-disconnect').addEventListener('click', async () => {
  const btn = $('btn-disconnect') as HTMLButtonElement;
  btn.textContent = 'Disconnecting…';
  btn.disabled = true;

  try {
    await provider.request({ method: 'wallet_disconnect' });
    onDisconnect();
  } catch (err) {
    log(`Disconnect error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    btn.textContent = 'Disconnect';
    btn.disabled = false;
  }
});

// ---------------------------------------------------------------------------
// Send ETH — bundles the transfer in a wallet_sendCalls user operation
// ---------------------------------------------------------------------------

$('btn-send').addEventListener('click', async () => {
  const to = ($('input-send-to') as HTMLInputElement).value.trim();
  const amountEth = ($('input-send-amount') as HTMLInputElement).value.trim();

  if (!to || !amountEth) {
    showResult('send-result', 'err', 'Missing fields', 'Enter a recipient address and an amount.');
    return;
  }

  const btn = $('btn-send') as HTMLButtonElement;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const { id } = await provider.request({
      method: 'wallet_sendCalls',
      params: [{ calls: [{ to, value: toHex(parseEther(amountEth)) }] }],
    }) as { id: string };

    btn.textContent = 'Confirming…';
    showResult('send-result', 'ok', 'Confirming…', id);

    const status = await waitForBundle(id);
    if (status === 200) {
      showResult('send-result', 'ok', 'Transaction confirmed', id);
      log(`Sent ${amountEth} ETH → ${to}`);
    } else {
      showResult('send-result', 'err', `Transaction failed (status ${status})`, id);
      log(`Send failed: status ${status}`);
    }
  } catch (err) {
    if (isUserRejection(err)) {
      log('Send cancelled');
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      showResult('send-result', 'err', 'Send failed', msg);
      log(`Send error: ${msg}`);
    }
  } finally {
    btn.textContent = 'Send ETH';
    btn.disabled = false;
  }
});

// ---------------------------------------------------------------------------
// Sign Message — personal_sign (EIP-191)
// ---------------------------------------------------------------------------

$('btn-sign').addEventListener('click', async () => {
  const message = ($('input-sign-message') as HTMLInputElement).value;

  if (!message) {
    showResult('sign-result', 'err', 'Missing message', 'Enter a message to sign.');
    return;
  }

  const btn = $('btn-sign') as HTMLButtonElement;
  btn.textContent = 'Signing…';
  btn.disabled = true;

  try {
    // personal_sign requires the message to be hex-encoded
    const sig = await provider.request({
      method: 'personal_sign',
      params: [toHex(message), connectedAddress],
    });

    const sigStr = typeof sig === 'string' ? sig : JSON.stringify(sig);
    showResult('sign-result', 'ok', 'Message signed', sigStr);
    log(`Signed: "${message}"`);
  } catch (err) {
    if (isUserRejection(err)) {
      log('Sign cancelled');
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      showResult('sign-result', 'err', 'Sign failed', msg);
      log(`Sign error: ${msg}`);
    }
  } finally {
    btn.textContent = 'Sign Message';
    btn.disabled = false;
  }
});

// ---------------------------------------------------------------------------
// Clear log
// ---------------------------------------------------------------------------

$('btn-clear-log').addEventListener('click', () => {
  $('event-log').innerHTML = '<p class="placeholder text-gray-600">Waiting for events…</p>';
});

// ---------------------------------------------------------------------------
// EIP-1193 events — the JAW provider fires standard wallet events
// ---------------------------------------------------------------------------

provider.on('accountsChanged', (accounts: string[]) => {
  log(`accountsChanged: ${JSON.stringify(accounts)}`);
  if (accounts.length > 0) {
    connectedAddress = accounts[0];
    $('account-address').textContent = accounts[0];
  } else {
    onDisconnect();
  }
});

provider.on('chainChanged', (chainId: string) => {
  log(`chainChanged: ${chainId}`);
  $('account-chain').textContent = String(parseInt(chainId, 16));
});

provider.on('connect', ({ chainId }: { chainId: string }) => {
  log(`connect event: chainId ${chainId}`);
});

provider.on('disconnect', (error: Error) => {
  log(`disconnect event: ${error.message}`);
  onDisconnect();
});

// ---------------------------------------------------------------------------
// On load — restore an existing session if the user already connected before
// ---------------------------------------------------------------------------

(async () => {
  try {
    const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
    if (accounts.length > 0) {
      const chainHex = await provider.request({ method: 'eth_chainId' }) as string;
      onConnect(accounts[0], parseInt(chainHex, 16));
      log('Session restored');
    }
  } catch {
    // No active session, start fresh
  }
})();
