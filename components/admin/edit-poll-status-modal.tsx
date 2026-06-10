"use client";

import { FormEvent, useEffect, useState } from "react";
import type { PollStatus, PollWithVotes } from "@/lib/types";

const STATUS_OPTIONS: { value: PollStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

type EditPollStatusModalProps = {
  poll: PollWithVotes;
  onClose: () => void;
  onSaved: () => void;
};

export function EditPollStatusModal({
  poll,
  onClose,
  onSaved,
}: EditPollStatusModalProps) {
  const [status, setStatus] = useState<PollStatus>(poll.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/polls/${poll.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to update poll");
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-surface p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white">Edit Poll Status</h3>
        <p className="mt-1 truncate text-sm text-white/50">{poll.title}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PollStatus)}
              className="w-full rounded-xl border border-white/10 bg-brand-bg px-4 py-3 text-white outline-none transition focus:border-brand-accent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="text-sm text-brand-accent">{error}</p> : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/80 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
