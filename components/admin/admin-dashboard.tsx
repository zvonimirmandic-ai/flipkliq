"use client";

import { useRouter } from "next/navigation";
import type { PollWithVotes } from "@/lib/types";
import { PollForm } from "@/components/admin/poll-form";
import { PollList } from "@/components/admin/poll-list";

type AdminDashboardProps = {
  polls: PollWithVotes[];
};

export function AdminDashboard({ polls }: AdminDashboardProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="border-b border-white/10 bg-brand-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-accent">
              FLIPKLIQ
            </p>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:text-white"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6 sm:py-8">
        <PollForm />

        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">All Polls</h2>
          <PollList polls={polls} />
        </section>
      </main>
    </div>
  );
}
