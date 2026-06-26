// Shared types mirroring the proxy's on-ramp response envelope.
// See apps/proxy/src/api/v2/onramp in jan-back-mono.

export type OnrampStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export interface ProxyEnvelope<T> {
  statusCode: number;
  result: {
    data: T | null;
    error: string | null;
  };
}

export interface StartResult {
  sessionId: string;
  expiresAt: string;
  otpRequired: boolean;
  otpChannel?: string;
}

export interface OnrampOrder {
  provider: string;
  providerOrderId: string;
  status: OnrampStatus;
  rawStatus: string;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoAmount?: string;
  cryptoCurrency: string;
  network: string;
  destinationAddress: string;
  fees?: { type: string; amount: string; currency: string }[];
  exchangeRate?: string;
  txHash?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateOtpResult {
  order: OnrampOrder;
  embeddable: {
    type: "IFRAME_URL";
    url: string;
  };
}

export interface StartBody {
  phoneNumber: string;
  email: string;
  fiatAmount: string;
  destinationAddress: string;
  fiatCurrency?: string;
  cryptoCurrency?: string;
  network?: string;
  paymentMethodHint?: "APPLE_PAY" | "GOOGLE_PAY";
}

// Thin browser-side client. It talks to OUR Next.js route handlers
// (/api/onramp/*), never to the proxy directly — the proxy x-api-key
// stays server-side.
async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const body = (await res.json()) as ProxyEnvelope<T>;
  if (!res.ok || body.result?.error) {
    throw new Error(body.result?.error ?? `Request failed (${res.status})`);
  }
  if (body.result?.data == null) {
    throw new Error("Empty response from on-ramp");
  }
  return body.result.data;
}

export const onrampClient = {
  start: (body: StartBody) =>
    call<StartResult>("/api/onramp/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  validateOtp: (sessionId: string, code: string) =>
    call<ValidateOtpResult>("/api/onramp/validate-otp", {
      method: "POST",
      body: JSON.stringify({ sessionId, code }),
    }),

  getOrder: (orderId: string) =>
    call<OnrampOrder>(`/api/onramp/orders/${encodeURIComponent(orderId)}`),
};
