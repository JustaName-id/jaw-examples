"use client";

import { useEffect, useRef, useState } from "react";
import { onrampClient, type OnrampOrder } from "@/lib/onramp";
import {
  ONRAMP_MAX_FIAT,
  ONRAMP_MIN_FIAT,
  ONRAMP_TERMINAL_STATUSES,
} from "@/lib/constants";

type Step = "form" | "otp" | "pay";

const STATUS_LABELS: Record<OnrampOrder["status"], string> = {
  PENDING: "Waiting for payment",
  PROCESSING: "Processing on-chain",
  COMPLETED: "Completed",
  FAILED: "Failed",
  EXPIRED: "Expired",
};

const STATUS_COLORS: Record<OnrampOrder["status"], string> = {
  PENDING: "text-amber-400",
  PROCESSING: "text-amber-400",
  COMPLETED: "text-emerald-400",
  FAILED: "text-red-400",
  EXPIRED: "text-red-400",
};

export function OnrampWidget({
  destinationAddress,
}: {
  destinationAddress: string;
}) {
  const [step, setStep] = useState<Step>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [phoneNumber, setPhoneNumber] = useState("+1");
  const [email, setEmail] = useState("");
  const [fiatAmount, setFiatAmount] = useState("25.00");
  const [paymentMethodHint, setPaymentMethodHint] = useState<
    "APPLE_PAY" | "GOOGLE_PAY"
  >("APPLE_PAY");

  // session / order
  const [sessionId, setSessionId] = useState("");
  const [otpChannel, setOtpChannel] = useState<string | undefined>();
  const [code, setCode] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [order, setOrder] = useState<OnrampOrder | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await onrampClient.start({
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        fiatAmount,
        destinationAddress,
        paymentMethodHint,
      });
      setSessionId(res.sessionId);
      setOtpChannel(res.otpChannel);
      // Coinbase always requires OTP; if a provider didn't, we'd skip to pay.
      setStep(res.otpRequired ? "otp" : "form");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start on-ramp");
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (orderId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const fresh = await onrampClient.getOrder(orderId);
        setOrder(fresh);
        if (
          ONRAMP_TERMINAL_STATUSES.includes(
            fresh.status as (typeof ONRAMP_TERMINAL_STATUSES)[number],
          )
        ) {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // transient; keep polling
      }
    }, 4000);
  };

  const handleValidate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await onrampClient.validateOtp(sessionId, code.trim());
      setOrder(res.order);
      setIframeUrl(res.embeddable.url);
      setStep("pay");
      startPolling(res.order.providerOrderId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep("form");
    setError(null);
    setSessionId("");
    setCode("");
    setIframeUrl("");
    setOrder(null);
  };

  const amountNum = Number(fiatAmount);
  const amountValid =
    !Number.isNaN(amountNum) &&
    amountNum >= ONRAMP_MIN_FIAT &&
    amountNum <= ONRAMP_MAX_FIAT;
  const formValid =
    /^\+1\d{10}$/.test(phoneNumber.trim()) &&
    /.+@.+\..+/.test(email.trim()) &&
    amountValid;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {step === "form" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-base font-semibold">Buy USDC on Base</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-400">
                Phone number (US, E.164)
              </label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+12025550123"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">
                Amount (USD, ${ONRAMP_MIN_FIAT}–${ONRAMP_MAX_FIAT})
              </label>
              <input
                inputMode="decimal"
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                placeholder="25.00"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">
                Payment method
              </label>
              <div className="flex gap-2">
                {(["APPLE_PAY", "GOOGLE_PAY"] as const).map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setPaymentMethodHint(pm)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      paymentMethodHint === pm
                        ? "border-blue-500 bg-blue-600/20 text-white"
                        : "border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    {pm === "APPLE_PAY" ? "Apple Pay" : "Google Pay"}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-3 text-xs text-gray-400">
              Destination:{" "}
              <code className="break-all font-mono text-emerald-400">
                {destinationAddress}
              </code>
            </div>

            <button
              onClick={handleStart}
              disabled={isLoading || !formValid}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Sending code..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-2 text-base font-semibold">Verify your phone</h3>
          <p className="mb-4 text-sm text-gray-400">
            We sent a code via {otpChannel ?? "SMS"} to {phoneNumber}.
          </p>
          <input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="mb-4 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-center font-mono text-lg tracking-[0.3em] text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800"
            >
              Back
            </button>
            <button
              onClick={handleValidate}
              disabled={isLoading || code.trim().length < 4}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify & continue"}
            </button>
          </div>
        </div>
      )}

      {step === "pay" && order && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-400">Status: </span>
                <span className={`font-medium ${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <button
                onClick={reset}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                New purchase
              </button>
            </div>
            {order.txHash && (
              <p className="mt-2 break-all text-xs text-gray-500">
                Tx: <span className="font-mono">{order.txHash}</span>
              </p>
            )}
          </div>

          {!ONRAMP_TERMINAL_STATUSES.includes(
            order.status as (typeof ONRAMP_TERMINAL_STATUSES)[number],
          ) && (
            <iframe
              src={iframeUrl}
              title="Coinbase on-ramp"
              allow="payment"
              className="h-[640px] w-full rounded-xl border border-gray-800 bg-white"
            />
          )}

          {order.status === "COMPLETED" && (
            <div className="rounded-lg bg-emerald-900/40 p-4 text-sm text-emerald-300">
              Done — {order.cryptoAmount ?? ""} {order.cryptoCurrency} arrived on{" "}
              {order.network}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
