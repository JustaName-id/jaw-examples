"use client";

import { useState } from "react";
import { useAccount } from "@/app/providers";

interface TypedDataField {
  name: string;
  type: string;
  value: string;
}

export function SignMessage() {
  const { account } = useAccount();

  // Personal sign state
  const [message, setMessage] = useState("Hello from JAW headless mode!");
  const [signature, setSignature] = useState<string | null>(null);

  // Typed data state
  const [domainName, setDomainName] = useState("JAW Headless Example");
  const [domainVersion, setDomainVersion] = useState("1");
  const [primaryType, setPrimaryType] = useState("Mail");
  const [fields, setFields] = useState<TypedDataField[]>([
    { name: "from", type: "address", value: "" },
    { name: "content", type: "string", value: "Hello from headless mode" },
  ]);
  const [typedSig, setTypedSig] = useState<string | null>(null);

  // Shared
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account) return null;

  const handlePersonalSign = async () => {
    setIsLoading(true);
    setError(null);
    setSignature(null);
    try {
      const sig = await account.signMessage(message);
      setSignature(sig);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signing failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignTypedData = async () => {
    setIsLoading(true);
    setError(null);
    setTypedSig(null);
    try {
      const types: Record<string, { name: string; type: string }[]> = {
        [primaryType]: fields.map((f) => ({ name: f.name, type: f.type })),
      };

      const messageObj: Record<string, string> = {};
      for (const f of fields) {
        messageObj[f.name] = f.value || (f.type === "address" ? account.address : "");
      }

      // Typed data is built dynamically from user input, so it can't satisfy
      // viem's statically-typed TypedData generics; cast the runtime-built args.
      const sig = await account.signTypedData({
        domain: {
          name: domainName,
          version: domainVersion,
          chainId: account.chainId,
        },
        types,
        primaryType,
        message: messageObj,
      } as unknown as Parameters<typeof account.signTypedData>[0]);
      setTypedSig(sig);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Typed data signing failed");
    } finally {
      setIsLoading(false);
    }
  };

  const addField = () => {
    setFields([...fields, { name: "", type: "string", value: "" }]);
  };

  const removeField = (index: number) => {
    if (fields.length <= 1) return;
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (
    index: number,
    key: keyof TypedDataField,
    value: string
  ) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-900/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Personal Sign (EIP-191) */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-4 text-base font-semibold">
          Personal Sign (EIP-191)
        </h3>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handlePersonalSign}
          disabled={isLoading || !message}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Signing..." : "Sign Message"}
        </button>

        {signature && (
          <div className="mt-4 rounded-lg bg-gray-800 p-3 text-sm">
            <span className="text-gray-400">Signature: </span>
            <code className="break-all font-mono text-xs text-emerald-400">
              {signature}
            </code>
          </div>
        )}
      </div>

      {/* Typed Data Sign (EIP-712) */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-4 text-base font-semibold">
          Typed Data Sign (EIP-712)
        </h3>

        {/* Domain */}
        <div className="mb-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Domain
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Name</label>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">
                Version
              </label>
              <input
                type="text"
                value={domainVersion}
                onChange={(e) => setDomainVersion(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Chain ID
            </label>
            <input
              type="text"
              value={account.chainId}
              disabled
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-gray-400"
            />
          </div>
        </div>

        {/* Primary Type */}
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Type
          </p>
          <div className="mt-2">
            <label className="mb-1 block text-sm text-gray-400">
              Primary Type
            </label>
            <input
              type="text"
              value={primaryType}
              onChange={(e) => setPrimaryType(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Fields */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Fields
            </p>
            <button
              onClick={addField}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-sm font-bold transition-colors hover:bg-gray-600"
              title="Add field"
            >
              +
            </button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Field #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      onClick={() => removeField(index)}
                      className="text-xs text-red-400 transition-colors hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="name"
                    className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="string">string</option>
                    <option value="address">address</option>
                    <option value="uint256">uint256</option>
                    <option value="bytes32">bytes32</option>
                    <option value="bool">bool</option>
                  </select>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField(index, "value", e.target.value)}
                    placeholder={
                      field.type === "address" ? account.address : "value"
                    }
                    className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignTypedData}
          disabled={isLoading || fields.length === 0}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? "Signing..." : "Sign Typed Data"}
        </button>

        {typedSig && (
          <div className="mt-4 rounded-lg bg-gray-800 p-3 text-sm">
            <span className="text-gray-400">Signature: </span>
            <code className="break-all font-mono text-xs text-blue-400">
              {typedSig}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
