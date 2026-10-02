import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Keep the Postgres driver out of the bundle; it is loaded from node_modules at runtime.
  serverExternalPackages: ["pg"],
};

export default withNextIntl(nextConfig);
