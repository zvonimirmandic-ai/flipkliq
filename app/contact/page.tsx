import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions, partnerships, or brand collaborations — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <main className="flex-1 bg-brand-bg">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-24">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Questions, partnerships, or brand collaborations — we&apos;d love
            to hear from you.
          </p>

          <dl className="mt-10 flex flex-col gap-4 text-white/80">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-semibold text-white">Email:</dt>
              <dd>
                <a
                  href="mailto:hello@flipkliq.com"
                  className="text-brand-accent hover:underline"
                >
                  hello@flipkliq.com
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-semibold text-white">
                For brands &amp; agencies:
              </dt>
              <dd>
                <a
                  href="mailto:partnerships@flipkliq.com"
                  className="text-brand-accent hover:underline"
                >
                  partnerships@flipkliq.com
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-semibold text-white">Location:</dt>
              <dd>Zagreb, Croatia</dd>
            </div>
          </dl>

          <div className="mt-12">
            <ContactForm />
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
