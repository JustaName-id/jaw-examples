"use client";

import { useState } from "react";
import { JustaName } from "@justaname.id/sdk";

interface TextRecord {
  key: string;
  value: string;
}

interface ProfileResult {
  name?: string;
  address?: string;
  textRecords: TextRecord[];
}

let justaNameInstance: Awaited<ReturnType<typeof JustaName.init>> | null = null;

async function getJustaName() {
  if (!justaNameInstance) {
    justaNameInstance = await JustaName.init({
      networks: [
        {
          chainId: 1,
          providerUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        },
      ],
    });
  }
  return justaNameInstance;
}

function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function ProfileResolver() {
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<ProfileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleResolve() {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setProfile(null);

    try {
      const justaName = await getJustaName();

      if (isAddress(trimmed)) {
        const result = await justaName.subnames.reverseResolve({
          address: trimmed as `0x${string}`,
          chainId: 1,
        });

        if (!result) {
          setError("No ENS name found for this address.");
          return;
        }

        const resultAny = result as unknown as Record<string, string>;
        const name =
          typeof result === "string"
            ? result
            : resultAny.name ?? resultAny.ens ?? String(result);

        const records = await justaName.subnames.getRecords({ ens: name });

        setProfile({
          name,
          address: trimmed,
          textRecords: extractTextRecords(records),
        });
      } else {
        const ens = trimmed.includes(".")
          ? trimmed
          : `${trimmed}.${process.env.NEXT_PUBLIC_ENS_DOMAIN}`;

        const records = await justaName.subnames.getRecords({ ens });

        setProfile({
          name: ens,
          textRecords: extractTextRecords(records),
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve profile."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
      <p className="text-sm text-gray-400">
        Look up any ENS name or Ethereum address to view its on-chain profile
        records. Enter a full name like{" "}
        <code className="text-indigo-400">alice.yourdomain.eth</code> or just
        the label like <code className="text-indigo-400">alice</code> to resolve
        under your configured domain.
      </p>

      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleResolve()}
          placeholder="alice.yourdomain.eth or 0x1234..."
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleResolve}
          disabled={isLoading || !query.trim()}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Resolving..." : "Resolve"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {profile && (
        <div className="space-y-4">
          {profile.name && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                ENS Name
              </p>
              <p className="font-mono text-sm text-white">{profile.name}</p>
            </div>
          )}

          {profile.address && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Address
              </p>
              <p className="font-mono text-sm text-white break-all">
                {profile.address}
              </p>
            </div>
          )}

          {profile.textRecords.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Text Records
              </p>
              <div className="divide-y divide-gray-800 rounded-lg border border-gray-800 bg-gray-950">
                {profile.textRecords.map((record) => (
                  <div
                    key={record.key}
                    className="flex items-start gap-4 px-4 py-3"
                  >
                    <span className="shrink-0 rounded bg-gray-800 px-2 py-0.5 text-xs font-medium text-indigo-400">
                      {record.key}
                    </span>
                    <span className="min-w-0 break-all text-sm text-gray-300">
                      {record.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No text records found for this name.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function extractTextRecords(records: unknown): TextRecord[] {
  if (!records || typeof records !== "object") return [];

  const rec = records as Record<string, unknown>;

  if (Array.isArray(rec.texts)) {
    return (rec.texts as Array<Record<string, string>>)
      .filter((t) => t.key && t.value)
      .map((t) => ({ key: t.key, value: t.value }));
  }

  if (rec.textRecords && typeof rec.textRecords === "object") {
    return Object.entries(rec.textRecords as Record<string, string>)
      .filter(([, v]) => v)
      .map(([k, v]) => ({ key: k, value: v }));
  }

  if (rec.records && typeof rec.records === "object") {
    const inner = rec.records as Record<string, unknown>;
    if (inner.texts && typeof inner.texts === "object") {
      return Object.entries(inner.texts as Record<string, string>)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ key: k, value: v }));
    }
  }

  return [];
}
