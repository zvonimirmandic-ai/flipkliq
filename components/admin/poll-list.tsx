"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditPollStatusModal } from "@/components/admin/edit-poll-status-modal";
import type { PollWithVotes } from "@/lib/types";

type PollListProps = {
  polls: PollWithVotes[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function statusStyles(status: PollWithVotes["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-300";
    case "archived":
      return "bg-white/10 text-white/60";
    default:
      return "bg-amber-500/15 text-amber-300";
  }
}

export function PollList({ polls }: PollListProps) {
  const router = useRouter();
  const [editingPoll, setEditingPoll] = useState<PollWithVotes | null>(null);

  if (polls.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-brand-surface p-8 text-center text-white/60">
        No polls yet. Create your first A/B poll above.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {polls.map((poll) => (
          <article
            key={poll.id}
            className="rounded-2xl border border-white/10 bg-brand-surface p-4 sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {poll.title}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${statusStyles(poll.status)}`}
                  >
                    {poll.status}
                  </span>
                </div>
                {poll.category ? (
                  <p className="mt-1 text-sm text-white/50">{poll.category}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPoll(poll)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:border-brand-accent hover:text-white"
                >
                  Edit
                </button>
                <p className="text-sm text-white/40">
                  {formatDate(poll.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-brand-bg p-3">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Option A
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-accent">
                  {poll.votes_a}
                </p>
                {poll.option_a_label ? (
                  <p className="mt-1 truncate text-sm text-white/70">
                    {poll.option_a_label}
                  </p>
                ) : null}
              </div>
              <div className="rounded-xl bg-brand-bg p-3">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  Option B
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-accent">
                  {poll.votes_b}
                </p>
                {poll.option_b_label ? (
                  <p className="mt-1 truncate text-sm text-white/70">
                    {poll.option_b_label}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingPoll ? (
        <EditPollStatusModal
          poll={editingPoll}
          onClose={() => setEditingPoll(null)}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </>
  );
}
