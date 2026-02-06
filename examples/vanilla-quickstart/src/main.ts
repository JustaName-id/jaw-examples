import './style.css';
import { JAW, Mode } from '@jaw.id/core';
import { toHex, parseEther, formatEther } from 'viem';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function show(el: HTMLElement) {
  el.classList.remove('hidden');
}

function hide(el: HTMLElement) {
  el.classList.add('hidden');
}

function disable(el: HTMLElement) {
  (el as HTMLButtonElement).disabled = true;
}

function enable(el: HTMLElement) {
  (el as HTMLButtonElement).disabled = false;
}

function renderResult(
  containerId: string,
  type: 'success' | 'error',
  title: string,
  detail: string,
) {
  const container = $(containerId);
  show(container);

  if (type === 'success') {
    container.innerHTML = `
      <div class="rounded-lg border border-green-900 bg-green-950/50 px-4 py-3">
        <p class="text-sm font-medium text-green-400">${title}</p>
        <p class="mt-1 font-mono text-xs text-green-400/80 break-all">${detail}</p>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3">
        <p class="text-sm font-medium text-red-400">${title}</p>
        <p class="mt-1 text-xs text-red-400/80 break-all">${detail}</p>
      </div>
    `;
  }
}

function logEvent(message: string) {
  const log = $('event-log');

  // Clear the placeholder on the first real event
  if (log.querySelector('.text-gray-600')) {
    log.innerHTML = '';
  }

  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.textContent = `[${time}] ${message}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// ---------------------------------------------------------------------------
// Initialize JAW
// ---------------------------------------------------------------------------

const jaw = JAW.create({
  apiKey: import.meta.env.VITE_JAW_API_KEY,
  appName: 'JAW Vanilla Quickstart',
  defaultChainId: 1,
  preference: {
    mode: Mode.CrossPlatform,
  },
});

const provider = jaw.provider;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let connectedAddress: string | null = null;

function setConnected(address: string, chainId?: number) {
  connectedAddress = address;

  // Update account display
  $('account-address').textContent = address;
  $('account-chain').textContent = String(chainId ?? 1);
  show($('account-info'));

  // Toggle buttons
  hide($('btn-connect'));
  show($('btn-disconnect'));

  // Show interactive sections
  show($('section-send'));
  show($('section-sign'));

  logEvent(`Connected: ${address}`);
}

function setDisconnected() {
  connectedAddress = null;

  // Update account display
  hide($('account-info'));
  $('account-address').textContent = '';
  $('account-chain').textContent = '';

  // Toggle buttons
  show($('btn-connect'));
  hide($('btn-disconnect'));

  // Hide interactive sections
  hide($('section-send'));
  hide($('section-sign'));

  // Reset results
  $('send-result').innerHTML = '';
  hide($('send-result'));
  $('sign-result').innerHTML = '';
  hide($('sign-result'));

  logEvent('Disconnected');
}

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

$('btn-connect').addEventListener('click', async () => {
  const btn = $('btn-connect') as HTMLButtonElement;
  btn.textContent = 'Connecting...';
  disable(btn);

  try {
    const result = await provider.request({
      method: 'wallet_connect',
      params: [{}],
    });

    const address = (result as { accounts: { address: string }[] }).accounts[0]
      ?.address;

    if (address) {
      setConnected(address);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logEvent(`Connect error: ${message}`);
  } finally {
    btn.textContent = 'Connect Wallet';
    enable(btn);
  }
});

// ---------------------------------------------------------------------------
// Disconnect
// ---------------------------------------------------------------------------

$('btn-disconnect').addEventListener('click', async () => {
  const btn = $('btn-disconnect') as HTMLButtonElement;
  btn.textContent = 'Disconnecting...';
  disable(btn);

  try {
    await provider.request({
      method: 'wallet_disconnect',
    });
    setDisconnected();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logEvent(`Disconnect error: ${message}`);
  } finally {
    btn.textContent = 'Disconnect';
    enable(btn);
  }
});

// ---------------------------------------------------------------------------
// Send ETH
// ---------------------------------------------------------------------------

$('btn-send').addEventListener('click', async () => {
  const to = ($('input-send-to') as HTMLInputElement).value.trim();
  const amountStr = ($('input-send-amount') as HTMLInputElement).value.trim();

  if (!to || !amountStr) {
    renderResult('send-result', 'error', 'Missing fields', 'Enter a recipient address and an amount.');
    return;
  }

  const btn = $('btn-send') as HTMLButtonElement;
  btn.textContent = 'Sending...';
  disable(btn);

  try {
    const value = `0x${parseEther(amountStr).toString(16)}`;

    const txResult = await provider.request({
      method: 'wallet_sendCalls',
      params: [
        {
          calls: [
            {
              to,
              value,
            },
          ],
        },
      ],
    });

    renderResult(
      'send-result',
      'success',
      'Transaction submitted',
      typeof txResult === 'string' ? txResult : JSON.stringify(txResult),
    );
    logEvent(`Sent ${amountStr} ETH to ${to}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    renderResult('send-result', 'error', 'Transaction failed', message);
    logEvent(`Send error: ${message}`);
  } finally {
    btn.textContent = 'Send ETH';
    enable(btn);
  }
});

// ---------------------------------------------------------------------------
// Sign Message
// ---------------------------------------------------------------------------

$('btn-sign').addEventListener('click', async () => {
  const message = ($('input-sign-message') as HTMLInputElement).value;

  if (!message) {
    renderResult('sign-result', 'error', 'Missing message', 'Enter a message to sign.');
    return;
  }

  if (!connectedAddress) {
    renderResult('sign-result', 'error', 'Not connected', 'Connect your wallet first.');
    return;
  }

  const btn = $('btn-sign') as HTMLButtonElement;
  btn.textContent = 'Signing...';
  disable(btn);

  try {
    const messageHex = toHex(message);

    const signature = await provider.request({
      method: 'personal_sign',
      params: [messageHex, connectedAddress],
    });

    renderResult(
      'sign-result',
      'success',
      'Message signed',
      typeof signature === 'string' ? signature : JSON.stringify(signature),
    );
    logEvent(`Signed message: "${message}"`);
  } catch (err: unknown) {
    const message_ = err instanceof Error ? err.message : String(err);
    renderResult('sign-result', 'error', 'Signing failed', message_);
    logEvent(`Sign error: ${message_}`);
  } finally {
    btn.textContent = 'Sign Message';
    enable(btn);
  }
});

// ---------------------------------------------------------------------------
// Clear event log
// ---------------------------------------------------------------------------

$('btn-clear-log').addEventListener('click', () => {
  $('event-log').innerHTML =
    '<p class="text-gray-600">Waiting for events...</p>';
});

// ---------------------------------------------------------------------------
// Provider Events
// ---------------------------------------------------------------------------

provider.on('accountsChanged', (accounts: string[]) => {
  logEvent(`accountsChanged: ${JSON.stringify(accounts)}`);

  if (accounts.length > 0) {
    connectedAddress = accounts[0];
    $('account-address').textContent = accounts[0];
  } else {
    setDisconnected();
  }
});

provider.on('chainChanged', (chainId: string) => {
  logEvent(`chainChanged: ${chainId}`);
  $('account-chain').textContent = String(parseInt(chainId, 16));
});

provider.on('connect', (info: { chainId: string }) => {
  logEvent(`connect: chainId ${info.chainId}`);
});

provider.on('disconnect', (error: { code: number; message: string }) => {
  logEvent(`disconnect: ${error.message}`);
  setDisconnected();
});

// ---------------------------------------------------------------------------
// On load: check for existing session
// ---------------------------------------------------------------------------

(async () => {
  try {
    const accounts = (await provider.request({
      method: 'eth_accounts',
    })) as string[];

    if (accounts.length > 0) {
      setConnected(accounts[0]);
      logEvent('Restored existing session');
    }
  } catch {
    // No existing session, nothing to do
  }
})();
