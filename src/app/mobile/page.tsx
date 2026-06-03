"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

const news = [
  { title: "Global markets steady as digital asset volume rebounds", offsetMinutes: 0, image: "bg-cyan-100" },
  { title: "Analysts watch BTC liquidity near major resistance levels", offsetMinutes: 18, image: "bg-blue-100" },
  { title: "Stablecoin settlement demand rises across Asian sessions", offsetMinutes: 45, image: "bg-emerald-100" },
  { title: "Weekly crypto infrastructure report highlights security trends", offsetMinutes: 120, image: "bg-slate-100" },
  { title: "Institutional flows lift attention across major trading pairs", offsetMinutes: 240, image: "bg-indigo-100" },
  { title: "Infrastructure providers expand settlement capacity", offsetMinutes: 360, image: "bg-sky-100" },
];

function formatNewsTime(timestamp: number, now: number) {
  const diffMinutes = Math.max(0, Math.round((now - timestamp) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffMinutes < 6 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  return `Today ${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp))}`;
}

export default function MobilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const pageNow = useMemo(() => Date.now(), []);
  const filteredNews = useMemo(
    () => news.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  async function handleSearch() {
    const value = query.trim();
    if (!value) return;

    try {
      const response = await fetch("/api/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const data = await response.json();
      if (response.ok && data.ok) {
        router.push("/exchange-demo");
        router.refresh();
      }
    } catch {
      // Keep the current text as a normal news search query.
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto min-h-screen max-w-md bg-white">
        <header className="bg-[#0b7df0] px-4 pb-5 pt-4 text-white">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-xl font-black">{t("mobileTitle")}</h1>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <input
              aria-label="Search news"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void handleSearch(); }}
              placeholder={t("searchPlaceholder")}
              className="min-w-0 flex-1 rounded-md border-0 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              aria-label="Search"
              onClick={handleSearch}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#075eb6] text-white"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </div>
        </header>

        <section className="px-4 py-4">
          <h2 className="mb-3 text-lg font-black">{t("latestUpdates")}</h2>
          <div className="space-y-3">
            {filteredNews.map((item) => (
              <article key={item.title} className="flex gap-3 border-b border-slate-100 bg-white pb-3">
                <div className={`h-20 w-28 shrink-0 rounded ${item.image}`} />
                <div className="min-w-0 py-1">
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-6 text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-xs text-slate-400">{formatNewsTime(pageNow - item.offsetMinutes * 60000, pageNow)}</p>
                </div>
              </article>
            ))}
            {filteredNews.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No results found</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
