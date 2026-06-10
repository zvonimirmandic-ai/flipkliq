import { ImageResponse } from "next/og";
import { getActivePollWithVotes } from "@/lib/active-polls";
import { loadOgFonts } from "@/lib/og-fonts";

export const dynamic = "force-dynamic";

const WIDTH = 1200;
const HEIGHT = 630;

const BRAND_BG = "#1A1A2E";
const BRAND_SURFACE = "#16213E";
const BRAND_ACCENT = "#E94560";

function getPercentages(votesA: number, votesB: number) {
  const total = votesA + votesB;

  if (total === 0) {
    return { a: 50, b: 50 };
  }

  return {
    a: Math.round((votesA / total) * 100),
    b: Math.round((votesB / total) * 100),
  };
}

function truncate(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

type OptionPanelProps = {
  imageUrl: string;
  label: string | null;
  fallbackLabel: string;
  percentage: number;
};

function OptionPanel({
  imageUrl,
  label,
  fallbackLabel,
  percentage,
}: OptionPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: BRAND_SURFACE,
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 24px",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {percentage}%
        </span>
        <span
          style={{
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: 24,
            marginTop: 8,
          }}
        >
          {truncate(label || fallbackLabel, 28)}
        </span>
      </div>
    </div>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: { pollId: string } },
) {
  try {
    const [poll, fonts] = await Promise.all([
      getActivePollWithVotes(params.pollId),
      loadOgFonts(),
    ]);

    if (!poll) {
      return new Response("Poll not found", { status: 404 });
    }

    const percentages = getPercentages(poll.votes_a, poll.votes_b);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: BRAND_BG,
            padding: "40px 48px 48px",
            fontFamily: "Inter",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                color: BRAND_ACCENT,
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: 8,
              }}
            >
              FLIPKLIQ
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 20,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 52,
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {truncate(poll.title, 70)}
            </span>
          </div>

          <div style={{ display: "flex", flex: 1, alignItems: "stretch" }}>
            <OptionPanel
              imageUrl={poll.option_a_image}
              label={poll.option_a_label}
              fallbackLabel="Option A"
              percentage={percentages.a}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 120,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 84,
                  height: 84,
                  borderRadius: 9999,
                  backgroundColor: BRAND_ACCENT,
                }}
              >
                <span
                  style={{
                    color: "#FFFFFF",
                    fontSize: 32,
                    fontWeight: 700,
                  }}
                >
                  VS
                </span>
              </div>
            </div>

            <OptionPanel
              imageUrl={poll.option_b_image}
              label={poll.option_b_label}
              fallbackLabel="Option B"
              percentage={percentages.b}
            />
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
          {
            name: "Inter",
            data: fonts.regular,
            weight: 400,
            style: "normal",
          },
          {
            name: "Inter",
            data: fonts.bold,
            weight: 700,
            style: "normal",
          },
        ],
        headers: {
          // Vote counts change, so don't let the default immutable caching stick.
          "Cache-Control":
            "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Failed to generate OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
