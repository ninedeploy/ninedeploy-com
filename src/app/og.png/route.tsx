import { ImageResponse } from "next/og";

// Served as /og.png so GitHub Pages sends it with an image content type; the
// opengraph-image file convention would export an extensionless file.
export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a101b",
          color: "#e8eef6",
          backgroundImage:
            "linear-gradient(rgba(232,238,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,238,246,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
          <svg width="46" height="60" viewBox="0 0 40 52" fill="none">
            <path d="M19.3 31 A13 13 0 1 1 29.2 27.2 L18.4 37.6" stroke="#e8eef6" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="18" r="2.6" fill="#7fbcb3" />
            <path d="M12.5 43.5h15M12.5 48.5h15" stroke="#7fbcb3" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
          nine deploy
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -5, lineHeight: 0.95 }}>Ship like</div>
          <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -5, lineHeight: 0.95 }}>you mean it.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 28, color: "#9fb0c6" }}>
          <div style={{ display: "flex", width: 240, height: 8, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: 120, height: 8, background: "#818cf8" }} />
            <div style={{ width: 120, height: 8, background: "#4ecdc4" }} />
          </div>
          Self-hosted PaaS · blue-green deploys · one SQLite file
        </div>
      </div>
    ),
    size,
  );
}
