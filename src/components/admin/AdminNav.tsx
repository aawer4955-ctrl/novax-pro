import Link from "next/link";

const navItems = [
  ["Dashboard", "/admin"],
  ["Users", "/admin/users"],
  ["KYC", "/admin/kyc"],
  ["Balances", "/admin/balances"],
  ["Ledger", "/admin/ledger"],
  ["Deposits", "/admin/deposits"],
  ["Withdrawals", "/admin/withdrawals"],
  ["Orders", "/admin/orders"],
  ["Markets", "/admin/markets"],
  ["Send Deposit Address", "/admin/send-address"],
  ["Address Management", "/admin/addresses"],
  ["Audit Logs", "/admin/audit-logs"],
  ["Risk Control", "/admin/risk"],
  ["Settings", "/admin/settings"],
] as const;

export function AdminNav() {
  return (
    <nav className="border-b border-white/10 bg-[#050814] px-4 py-3 text-white">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
        {navItems.map(([label, href]) => (
          <Link key={href} href={href} className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
