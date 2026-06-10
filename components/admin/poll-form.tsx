"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { POLL_CATEGORIES } from "@/lib/types";

export function PollForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/polls", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to create poll");
        return;
      }

      setSuccess("Poll created successfully.");
      form.reset();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-brand-surface p-4 sm:p-6"
    >
      <h2 className="text-xl font-semibold text-white">Create New Poll</h2>

      <div className="mt-5 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Title
          </label>
          <input
            name="title"
            type="text"
            required
            className="w-full rounded-xl border border-white/10 bg-brand-bg px-4 py-3 text-white outline-none transition focus:border-brand-accent"
            placeholder="Which design wins?"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <OptionFields
            side="A"
            imageName="option_a_image"
            labelName="option_a_label"
          />
          <OptionFields
            side="B"
            imageName="option_b_image"
            labelName="option_b_label"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Category
            </label>
            <select
              name="category"
              required
              defaultValue="Fashion"
              className="w-full rounded-xl border border-white/10 bg-brand-bg px-4 py-3 text-white outline-none transition focus:border-brand-accent"
            >
              {POLL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Status
            </label>
            <select
              name="status"
              defaultValue="draft"
              className="w-full rounded-xl border border-white/10 bg-brand-bg px-4 py-3 text-white outline-none transition focus:border-brand-accent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-brand-accent">{error}</p> : null}
      {success ? (
        <p className="mt-4 text-sm text-emerald-300">{success}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-brand-accent px-4 py-3 font-semibold text-white transition hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {loading ? "Creating..." : "Create Poll"}
      </button>
    </form>
  );
}

function OptionFields({
  side,
  imageName,
  labelName,
}: {
  side: "A" | "B";
  imageName: string;
  labelName: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-brand-bg/60 p-4">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-accent">
        Option {side}
      </p>

      <label className="mb-2 block text-sm font-medium text-white/80">
        Image
      </label>
      <input
        name={imageName}
        type="file"
        accept="image/*"
        required
        className="w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
      />

      <label className="mb-2 mt-4 block text-sm font-medium text-white/80">
        Label
      </label>
      <input
        name={labelName}
        type="text"
        className="w-full rounded-xl border border-white/10 bg-brand-bg px-4 py-3 text-white outline-none transition focus:border-brand-accent"
        placeholder={`Option ${side} label`}
      />
    </div>
  );
}
