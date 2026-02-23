"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "@/app/providers";

const NAV_ITEMS = [
  { href: "/", label: "Account" },
  { href: "/transactions", label: "Transactions" },
  { href: "/signing", label: "Signing" },
  { href: "/permissions", label: "Permissions" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { account } = useAccount();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-800 bg-gray-950 p-4">
      <div className="mb-8">
        <h1 className="text-lg font-bold">JAW Headless</h1>
        <p className="mt-1 text-xs text-gray-500">Account API Example</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive = pathname === href;
          const isDisabled = href !== "/" && !account;

          if (isDisabled) {
            return (
              <span
                key={href}
                className="rounded-lg px-3 py-2 text-sm text-gray-600 cursor-not-allowed"
              >
                {label}
              </span>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {account && (
        <div className="border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-500">Connected</p>
          <p className="mt-0.5 truncate font-mono text-xs text-emerald-400">
            {account.address}
          </p>
        </div>
      )}
    </aside>
  );
}
