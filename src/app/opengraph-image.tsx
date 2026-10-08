import { ImageResponse } from "next/og";

export const alt = "NineDeploy — ship like you mean it";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "#0d1522",
          color: "#e8eef6",
          backgroundImage:
            "linear-gradient(rgba(232,238,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,238,246,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#4ecdc4", display: "flex" }} />
          NineDeploy
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -5, lineHeight: 0.95 }}>Ship like</div>
          <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -5, lineHeight: 0.95 }}>you mean it.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 28, color: "#9fb0c6" }}>
          <div style={{ display: "flex", width: 240, height: 8, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: 120, height: 8, background: "#7d96ff" }} />
            <div style={{ width: 120, height: 8, background: "#4ecdc4" }} />
          </div>
          Self-hosted PaaS · blue-green deploys · one SQLite file
        </div>
      </div>
    ),
    size,
  );
}
