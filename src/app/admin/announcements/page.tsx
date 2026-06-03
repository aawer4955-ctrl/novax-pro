"use client";

import Link from "next/link";
import { useState } from "react";

type Announcement = {
  id: string;
  title: string;
  type: string;
  published: string;
  status: string;
};

const initialAnnouncements: Announcement[] = [
  { id: "ANN-1201", title: "USDT Wallet Maintenance", type: "System", published: "2026-05-18 09:00", status: "Published" },
  { id: "ANN-1202", title: "New SOL Futures Pair", type: "Listing", published: "2026-05-18 13:30", status: "Draft" },
  { id: "ANN-1203", title: "Fee Rate Adjustment Notice", type: "Operations", published: "2026-05-19 10:00", status: "Scheduled" },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [nextId, setNextId] = useState(1204);

  const addAnnouncement = () => {
    const id = `ANN-${nextId}`;
    setAnnouncements((current) => [
      {
        id,
        title: `Announcement ${nextId}`,
        type: "System",
        published: "Now",
        status: "Draft",
      },
      ...current,
    ]);
    setNextId((current) => current + 1);
  };

  const editAnnouncement = (id: string) => {
    setAnnouncements((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "Edited" } : item))
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((current) => current.filter((item) => item.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <header className="border-b border-white/10 bg-[#050814]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/admin"><h1 className="text-2xl font-black">NovaX Admin</h1><p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Announcement Center</p></Link><Link href="/admin" className="text-sm text-slate-300 hover:text-white">Dashboard</Link></div></header>
      <section className="mx-auto max-w-7xl px-6 py-12"><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Content Operations</p><h2 className="mt-3 text-4xl font-black">公告管理</h2><p className="mt-3 text-slate-400">新增、编辑、删除公告内容。</p></div><button onClick={addAnnouncement} className="rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950 hover:bg-cyan-200">新增公告</button></div><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-black/25 text-slate-400"><tr><th className="px-6 py-4">公告 ID</th><th className="px-6 py-4">标题</th><th className="px-6 py-4">公告类型</th><th className="px-6 py-4">发布时间</th><th className="px-6 py-4">状态</th><th className="px-6 py-4 text-right">操作</th></tr></thead><tbody>{announcements.map((item) => (<tr key={item.id} className="border-t border-white/5"><td className="px-6 py-5 font-bold">{item.id}</td><td className="px-6 py-5 text-slate-200">{item.title}</td><td className="px-6 py-5 text-cyan-200">{item.type}</td><td className="px-6 py-5 text-slate-400">{item.published}</td><td className="px-6 py-5"><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">{item.status}</span></td><td className="px-6 py-5"><div className="flex justify-end gap-2"><button onClick={() => editAnnouncement(item.id)} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold hover:bg-white/10">编辑</button><button onClick={() => deleteAnnouncement(item.id)} className="rounded-xl border border-rose-300/30 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/10">删除</button></div></td></tr>))}</tbody></table></div></section>
    </main>
  );
}
