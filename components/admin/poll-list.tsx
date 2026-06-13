"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditPollStatusModal } from "@/components/admin/edit-poll-status-modal";
import type { PollWithVotes } from "@/lib/types";

type PollListProps = {
  polls: PollWithVotes[];
};

// A thumbnail of an option image with an inline "Replace" upload control.
function ReplaceableThumb({
  pollId,
  side,
  label,
  url,
  onReplaced,
}: {
  pollId: string;
  side: "a" | "b";
  label: string;
  url: string;
  onReplaced: (newUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("side", side);
      formData.append("image", file);

      const response = await fetch(`/api/admin/polls/${pollId}/image`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      onReplaced(data.image_url as string);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-white/10 bg-brand-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={`Option ${label}`} className="h-full w-full object-cover" />
        <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] font-bold text-white">
          {label}
        </span>
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        ) : null}
      </div>
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-white/80 transition hover:border-brand-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Replace"}
        </button>
        {error ? <p className="mt-1 text-xs text-brand-accent">{error}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

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
  // Replaced image URLs, keyed `${pollId}:${side}`, so a swapped image shows
  // immediately without a full page reload.
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>(
    {},
  );

  const imageFor = (pollId: string, side: "a" | "b", fallback: string) =>
    imageOverrides[`${pollId}:${side}`] ?? fallback;

  const handleReplaced = (pollId: string, side: "a" | "b", url: string) =>
    setImageOverrides((prev) => ({ ...prev, [`${pollId}:${side}`]: url }));

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

                <div className="mt-3 flex flex-wrap gap-4">
                  <ReplaceableThumb
                    pollId={poll.id}
                    side="a"
                    label="A"
                    url={imageFor(poll.id, "a", poll.option_a_image)}
                    onReplaced={(url) => handleReplaced(poll.id, "a", url)}
                  />
                  <ReplaceableThumb
                    pollId={poll.id}
                    side="b"
                    label="B"
                    url={imageFor(poll.id, "b", poll.option_b_image)}
                    onReplaced={(url) => handleReplaced(poll.id, "b", url)}
                  />
                </div>
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
