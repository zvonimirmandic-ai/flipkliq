import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const DESCRIPTION =
  "FLIPKLIQ is mobile-first A/B visual voting. Pick a side in seconds, see live results, and share the matchups you care about.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FLIPKLIQ — A/B Visual Voting",
    template: "%s | FLIPKLIQ",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "FLIPKLIQ — A/B Visual Voting",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "FLIPKLIQ",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "FLIPKLIQ — A/B Visual Voting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FLIPKLIQ — A/B Visual Voting",
    description: DESCRIPTION,
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
