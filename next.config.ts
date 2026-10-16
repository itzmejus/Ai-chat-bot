import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Node-only libraries: load them from node_modules at runtime instead of bundling.
  serverExternalPackages: ["pg", "pg-boss", "undici", "unpdf", "mammoth", "js-tiktoken", "sharp"],
  // Keep the dev-mode indicator away from the sidebar controls in the bottom-left corner.
  devIndicators: { position: "bottom-right" },
  async headers() {
    const always = [
      // Browsers use HTTPS for this host for a year (ignored over plain http, so local development is unaffected).
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];
    return [
      { source: "/:path*", headers: always },
      {
        // Site pictures in public/images. Next.js serves public files with max-age=0 because they
        // can change under the same name; these rarely do, so browsers may keep them for a week
        // (and use a stale copy for a day while fetching a fresh one). Give a changed picture a new name.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        // No other website may show these pages inside a frame (clickjacking). The chat iframe
        // (/embed/...) is left out: customers' websites must frame it, and it sets its own
        // frame-ancestors from the business's list of approved websites.
        source: "/:path((?!embed/).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
