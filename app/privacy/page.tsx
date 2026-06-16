import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How FLIPKLIQ collects, uses, and protects your data under the GDPR.",
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Data Controller",
    body: (
      <p>
        FLIPKLIQ, Zagreb, Croatia. Contact:{" "}
        <a
          href="mailto:hello@flipkliq.com"
          className="text-brand-accent hover:underline"
        >
          hello@flipkliq.com
        </a>
      </p>
    ),
  },
  {
    heading: "2. Data We Collect",
    body: (
      <ul className="list-disc space-y-3 pl-6">
        <li>
          <strong className="text-white">Device fingerprint</strong> — A
          non-identifying hash generated from your browser/device
          characteristics (via FingerprintJS open-source library). Used solely
          to prevent duplicate votes. Not linked to your identity.
        </li>
        <li>
          <strong className="text-white">Vote data</strong> — Which option you
          voted for in each poll. Stored anonymously.
        </li>
        <li>
          <strong className="text-white">Local storage</strong> — A list of
          poll IDs you&apos;ve voted on is stored in your browser&apos;s
          localStorage to prevent re-voting. This data never leaves your
          device.
        </li>
        <li>
          <strong className="text-white">Usage data</strong> — Standard server
          logs (IP address, browser type, pages visited) collected
          automatically by our hosting provider (Vercel). Retained for up to
          30 days.
        </li>
        <li>
          <strong className="text-white">Country data</strong> — Your
          approximate country is derived from your IP address via our hosting
          provider (Vercel) at the time of voting. This country-level data
          (not your precise location or IP address) is stored permanently in
          our database and displayed publicly as aggregate voting statistics
          (e.g., &quot;Country Battle&quot;). No precise location data is
          stored.
        </li>
        <li>
          <strong className="text-white">Analytics data</strong> — We use
          Google Analytics 4 to collect anonymised usage data including pages
          visited, session duration, approximate geographic region, and device
          type. This data is processed by Google LLC and subject to Google&apos;s
          Privacy Policy.
        </li>
      </ul>
    ),
  },
  {
    heading: "3. How We Use Your Data",
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>To display accurate, real-time voting results;</li>
        <li>To prevent duplicate votes;</li>
        <li>To improve platform performance;</li>
        <li>To monitor for abuse or technical issues.</li>
      </ul>
    ),
  },
  {
    heading: "4. Legal Basis (GDPR)",
    body: (
      <p>
        We process data based on legitimate interests (Art. 6(1)(f) GDPR) —
        specifically, providing a fair and functional voting service.
      </p>
    ),
  },
  {
    heading: "5. Third-Party Processors",
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong className="text-white">Vercel Inc. (USA)</strong> — hosting
          and CDN. Data Processing Agreement in place.
        </li>
        <li>
          <strong className="text-white">Supabase Inc. (USA)</strong> —
          database storage. GDPR compliant.
        </li>
        <li>
          <strong className="text-white">Cloudinary Ltd. (USA)</strong> —
          image hosting. GDPR compliant.
        </li>
        <li>
          <strong className="text-white">Google LLC (USA)</strong> — Google
          Analytics 4 for usage analytics. Subject to Google&apos;s Data
          Processing Terms.
        </li>
      </ul>
    ),
  },
  {
    heading: "6. Data Retention",
    body: (
      <p>
        Anonymous vote data is retained indefinitely as it forms the basis of
        poll results. Server logs are deleted after 30 days.
      </p>
    ),
  },
  {
    heading: "7. Your Rights (GDPR)",
    body: (
      <>
        <p>As an EU resident, you have the right to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Access data held about you;</li>
          <li>
            Request erasure (note: as votes are anonymous, we may be unable to
            identify and delete your specific vote);
          </li>
          <li>
            Lodge a complaint with the Croatian Personal Data Protection
            Agency (AZOP) at{" "}
            <a
              href="https://azop.hr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:underline"
            >
              azop.hr
            </a>
            .
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: "8. Cookies",
    body: (
      <p>
        FLIPKLIQ uses browser localStorage (not cookies) for vote history. We
        also use Google Analytics 4, which sets analytics cookies (_ga,
        _ga_*) in your browser. These cookies are used solely for anonymised
        usage analytics and not for advertising or tracking across other
        sites.
      </p>
    ),
  },
  {
    heading: "9. Children's Privacy",
    body: (
      <p>
        FLIPKLIQ is not directed at children under 16. We do not knowingly
        collect data from minors.
      </p>
    ),
  },
  {
    heading: "10. Changes to This Policy",
    body: (
      <p>
        We may update this policy periodically. The current version will
        always be available at flipkliq.com/privacy.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <main className="flex-1 bg-brand-bg">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-white/50">Last updated: June 2026</p>

          <p className="mt-8 leading-relaxed text-white/70">
            FLIPKLIQ is committed to protecting your privacy. This policy
            explains what data we collect, how we use it, and your rights
            under the General Data Protection Regulation (GDPR).
          </p>

          <div className="mt-10 space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-white">
                  {section.heading}
                </h2>
                <div className="mt-3 leading-relaxed text-white/70">
                  {section.body}
                </div>
              </section>
            ))}

            <section>
              <h2 className="text-xl font-bold text-white">Contact</h2>
              <p className="mt-3 leading-relaxed text-white/70">
                <a
                  href="mailto:hello@flipkliq.com"
                  className="text-brand-accent hover:underline"
                >
                  hello@flipkliq.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
