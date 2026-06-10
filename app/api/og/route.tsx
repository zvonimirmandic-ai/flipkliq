import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";

const BRAND_BG = "#0A0A0A";
const BRAND_SURFACE = "#16213E";
const BRAND_ACCENT = "#E94560";

export async function GET() {
  try {
    const fonts = await loadOgFonts();

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: BRAND_BG,
            fontFamily: "Inter",
          }}
        >
          <span
            style={{
              color: BRAND_ACCENT,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: 16,
            }}
          >
            FLIPKLIQ
          </span>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 36,
              marginTop: 28,
            }}
          >
            A/B visual voting. Pick a side in seconds.
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 64,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 220,
                height: 130,
                borderRadius: 20,
                backgroundColor: BRAND_SURFACE,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              A
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 76,
                height: 76,
                borderRadius: 9999,
                backgroundColor: BRAND_ACCENT,
                margin: "0 28px",
                color: "#FFFFFF",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              VS
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 220,
                height: 130,
                borderRadius: 20,
                backgroundColor: BRAND_SURFACE,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              B
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Inter", data: fonts.regular, weight: 400, style: "normal" },
          { name: "Inter", data: fonts.bold, weight: 700, style: "normal" },
        ],
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (error) {
    console.error("Failed to generate brand OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
