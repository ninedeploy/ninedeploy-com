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
          padding: 56,
          background: "#0a101b",
          color: "#e8eef6",
          backgroundImage:
            "radial-gradient(ellipse at 90% 30%, rgba(79,70,229,0.18), transparent 65%), linear-gradient(rgba(232,238,246,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(232,238,246,0.035) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 32, fontWeight: 700 }}>
          <svg width="46" height="60" viewBox="0 0 40 52" fill="none">
            <path d="M19.3 31 A13 13 0 1 1 29.2 27.2 L18.4 37.6" stroke="#e8eef6" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="18" r="2.6" fill="#7fbcb3" />
            <path d="M12.5 43.5h15M12.5 48.5h15" stroke="#7fbcb3" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
          nine deploy
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #2d3d58", borderRadius: 24, padding: "10px 18px", color: "#9fb0c6", fontSize: 18 }}>
            <div style={{ width: 8, height: 8, background: "#4ecdc4", borderRadius: 8 }} />
            YOUR SERVER. YOUR RULES.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 650 }}>
            <div style={{ color: "#4ecdc4", fontSize: 18, letterSpacing: 3, marginBottom: 20 }}>SELF-HOSTED DEPLOYMENT PLATFORM</div>
            <div style={{ fontSize: 94, fontWeight: 800, letterSpacing: -4, lineHeight: 1.02 }}>Ship like</div>
            <div style={{ fontSize: 94, fontWeight: 800, letterSpacing: -4, lineHeight: 1.02 }}>you mean it.</div>
            <div style={{ display: "flex", flexDirection: "column", color: "#9fb0c6", fontSize: 25, lineHeight: 1.4, marginTop: 24, maxWidth: 580 }}>
              <span>Push a branch. Get a healthy deploy.</span>
              <span>Keep your infrastructure.</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", width: 340, gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#101a2b", border: "1px solid #4ecdc4", borderRadius: 20, padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ color: "#4ecdc4", fontSize: 22, fontWeight: 700 }}>api-green</div>
                <div style={{ color: "#9fb0c6", fontSize: 18 }}>Healthcheck passed</div>
                <div style={{ display: "flex", gap: 5 }}>{[0, 1, 2, 3, 4, 5, 6].map((n) => <div key={n} style={{ width: 24, height: 5, background: "#4ecdc4", borderRadius: 3 }} />)}</div>
              </div>
              <div style={{ color: "#4ecdc4", fontSize: 16 }}>LIVE</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9fb0c6", fontSize: 17, paddingLeft: 24 }}>
              <svg width="20" height="28" viewBox="0 0 20 28"><path d="M10 1v22m-6-6 6 6 6-6" stroke="#4ecdc4" strokeWidth="2" fill="none" /></svg>
              Traffic switched. Zero downtime.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, background: "#101a2b", border: "1px solid #2d3d58", borderRadius: 20, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#818cf8", fontSize: 22, fontWeight: 700 }}>api-blue</span>
                <span style={{ color: "#9fb0c6", fontSize: 16 }}>STANDBY</span>
              </div>
              <div style={{ color: "#9fb0c6", fontSize: 18 }}>Ready to roll back</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #1e2a3e", paddingTop: 24, fontSize: 20, color: "#9fb0c6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", width: 64, height: 5, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: 32, height: 5, background: "#818cf8" }} />
              <div style={{ width: 32, height: 5, background: "#4ecdc4" }} />
            </div>
            Docker · Automatic TLS · Managed databases
          </div>
          <div style={{ color: "#e8eef6", fontWeight: 700 }}>ninedeploy.com</div>
        </div>
      </div>
    ),
    size,
  );
}
