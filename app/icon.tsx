import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1A1A2E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
        }}
      >
        {/* Left square - solid white */}
        <div style={{ width: 11, height: 11, background: "#FFFFFF" }} />
        {/* Right square - red outline */}
        <div style={{ width: 11, height: 11, border: "2px solid #E94560" }} />
      </div>
    ),
    { ...size },
  );
}
