import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions for using FLIPKLIQ.",
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Acceptance of Terms",
    body: (
      <p>
        By accessing and using FLIPKLIQ (flipkliq.com), you agree to these
        Terms. If you do not agree, please do not use the platform.
      </p>
    ),
  },
  {
    heading: "2. Service Description",
    body: (
      <p>
        FLIPKLIQ is a visual voting platform that allows users to view
        image-based polls and cast anonymous votes. No account or registration
        is required to use the service.
      </p>
    ),
  },
  {
    heading: "3. User Conduct",
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Submit or share illegal, harmful, or misleading content;</li>
          <li>
            Attempt to manipulate voting results through automated means;
          </li>
          <li>
            Reverse-engineer or interfere with the platform&apos;s
            functionality;
          </li>
          <li>Use the service in any way that violates applicable laws.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "4. Content & Intellectual Property",
    body: (
      <p>
        All poll content, imagery, and platform design are the property of
        FLIPKLIQ or licensed third parties. Voting results and aggregated data
        are owned by FLIPKLIQ. Users may share individual poll result cards
        for personal, non-commercial purposes.
      </p>
    ),
  },
  {
    heading: "5. Anonymous Voting",
    body: (
      <p>
        Votes are recorded anonymously using a device fingerprint. FLIPKLIQ
        does not link votes to personal identities. Vote data is used solely
        to display aggregate results.
      </p>
    ),
  },
  {
    heading: "6. Third-Party Services",
    body: (
      <p>
        FLIPKLIQ uses third-party infrastructure including Supabase
        (database), Cloudinary (image hosting), and Vercel (hosting). Your use
        of the platform is also subject to their respective terms of service.
      </p>
    ),
  },
  {
    heading: "7. Disclaimer of Warranties",
    body: (
      <p>
        The platform is provided &quot;as is&quot; without warranties of any
        kind. FLIPKLIQ does not guarantee uninterrupted availability or
        accuracy of results.
      </p>
    ),
  },
  {
    heading: "8. Limitation of Liability",
    body: (
      <p>
        To the fullest extent permitted by law, FLIPKLIQ shall not be liable
        for any indirect, incidental, or consequential damages arising from
        your use of the service.
      </p>
    ),
  },
  {
    heading: "9. Changes to Terms",
    body: (
      <p>
        We reserve the right to modify these Terms at any time. Continued use
        of the platform after changes constitutes acceptance of the updated
        Terms.
      </p>
    ),
  },
  {
    heading: "10. Governing Law",
    body: (
      <p>
        These Terms are governed by the laws of the Republic of Croatia. Any
        disputes shall be subject to the jurisdiction of the courts of Zagreb,
        Croatia.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <SiteShell>
      <main className="flex-1 bg-brand-bg">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm text-white/50">Last updated: June 2026</p>

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
                For questions regarding these Terms, contact us at{" "}
                <a
                  href="mailto:hello@flipkliq.com"
                  className="text-brand-accent hover:underline"
                >
                  hello@flipkliq.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
