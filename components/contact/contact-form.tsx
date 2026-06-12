"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-white/10 bg-brand-surface p-8 text-center"
      >
        <p className="text-xl font-bold text-white">
          Thanks! We&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white/70">Name</span>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          className="min-h-[44px] rounded-xl border border-white/10 bg-brand-surface px-4 text-white placeholder:text-white/30 focus:border-brand-accent focus:outline-none"
          placeholder="Your name"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white/70">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="min-h-[44px] rounded-xl border border-white/10 bg-brand-surface px-4 text-white placeholder:text-white/30 focus:border-brand-accent focus:outline-none"
          placeholder="you@example.com"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white/70">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          className="rounded-xl border border-white/10 bg-brand-surface px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-accent focus:outline-none"
          placeholder="What's on your mind?"
        />
      </label>

      <button
        type="submit"
        className="mt-2 inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-accent px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/90"
      >
        Send
      </button>
    </form>
  );
}
