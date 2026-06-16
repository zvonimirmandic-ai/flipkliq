import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#1A1A2E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 17,
        }}
      >
        {/* Left square - solid white */}
        <div style={{ width: 62, height: 62, background: "#FFFFFF" }} />
        {/* Right square - red outline */}
        <div style={{ width: 62, height: 62, border: "11px solid #E94560" }} />
      </div>
    ),
    { ...size },
  );
}
