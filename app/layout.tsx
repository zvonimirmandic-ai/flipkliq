import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
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
    default: "FLIPKLIQ — Pick a side. See the world.",
    template: "%s | FLIPKLIQ",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "FLIPKLIQ — Pick a side. See the world.",
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
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
        <GoogleAnalytics gaId="G-GFHHQX28X1" />
      </body>
    </html>
  );
}
