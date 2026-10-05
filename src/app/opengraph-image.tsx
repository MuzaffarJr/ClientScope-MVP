import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LABELS = ["Questions", "Scope", "Workload", "Timeline", "Boundaries"];

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
          background: "radial-gradient(circle at 82% 40%, #04413d 0%, #012624 45%, #011d1c 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}>
          <svg width="44" height="44" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10.25" fill="none" stroke="#edfffe" strokeOpacity="0.35" strokeWidth="1" />
            <circle cx="12" cy="12" r="6" fill="none" stroke="#edfffe" strokeWidth="1" />
            <circle cx="12" cy="12" r="1.75" fill="#fde9ff" />
          </svg>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", fontSize: 76, lineHeight: 1.02, letterSpacing: "-0.04em", maxWidth: 940 }}>
          Turn vague client requests into scopes you can defend.
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {LABELS.map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                fontSize: 20,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#bbc7c6",
                border: "1px solid rgba(237,255,254,0.2)",
                borderRadius: 6,
                padding: "10px 16px",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
