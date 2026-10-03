import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/config";
import { LOGO_BUBBLE, LOGO_SPARK } from "@/lib/logo";

// Rendered per request so APP_NAME comes from the running server's environment.
export const dynamic = "force-dynamic";
export const alt = "AI customer support for UAE businesses, in your customers' language";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The picture shown when a link to the site is shared (WhatsApp, LinkedIn, X...). */
export default function OpenGraphImage() {
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
          color: "#ffffff",
          backgroundColor: "#16161b",
          backgroundImage: "radial-gradient(circle at 100% 0%, rgba(37,99,235,0.75), rgba(37,99,235,0) 55%), radial-gradient(circle at 0% 100%, rgba(251,191,36,0.18), rgba(251,191,36,0) 50%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="#2563eb" />
            <path d={LOGO_BUBBLE} fill="#ffffff" />
            <path d={LOGO_SPARK} fill="#2563eb" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{APP_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2, maxWidth: 980 }}>{"AI customer support that answers in your customers' language"}</div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.75)", maxWidth: 900 }}>Answers only from your business information. Captures leads. Hands over to your team.</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Built for UAE businesses", "24/7", "One line of code"].map((label) => (
            <div key={label} style={{ display: "flex", padding: "12px 22px", borderRadius: 999, fontSize: 24, backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
