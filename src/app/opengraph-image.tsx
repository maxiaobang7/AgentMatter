import { ImageResponse } from "next/og";

export const alt = "AgentMatter — Everything your agent needs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          color: "#ffffff",
          background: "#071329",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ width: 20, background: "#a3ff12" }} />
        <div style={{ flex: 1, padding: "70px 76px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, fontWeight: 700 }}>
            <div style={{ display: "flex", flexWrap: "wrap", width: 42, height: 42, gap: 5 }}>
              <span style={{ width: 18, height: 18, background: "#574ce8", borderRadius: 3 }} />
              <span style={{ width: 18, height: 18, background: "#a3ff12", borderRadius: 3 }} />
              <span style={{ width: 18, height: 18, background: "#574ce8", borderRadius: 3 }} />
              <span style={{ width: 18, height: 18, background: "#574ce8", borderRadius: 3 }} />
            </div>
            AgentMatter
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ fontSize: 78, lineHeight: 1, fontWeight: 800, letterSpacing: -4 }}>Everything your agent needs.</div>
            <div style={{ color: "#b8c2d8", fontSize: 28 }}>GitHub Skills · DSH Plugins · Agent Plugins · MCP Servers · Prompts</div>
          </div>
          <div style={{ display: "flex", gap: 14, color: "#a3ff12", fontSize: 20, letterSpacing: 1 }}>
            CURATED · OPEN SOURCE · CONTINUOUSLY UPDATED
          </div>
        </div>
        <div style={{ width: 330, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #263552" }}>
          <div style={{ width: 210, height: 210, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #7d8ba7", color: "#a3ff12", fontSize: 76 }}>
            {"</>"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
