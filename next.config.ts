import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Node-only libraries: load them from node_modules at runtime instead of bundling.
  serverExternalPackages: ["pg", "pg-boss", "undici", "unpdf", "mammoth", "js-tiktoken"],
};

export default withNextIntl(nextConfig);
