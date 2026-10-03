import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/config";

// Built per request so APP_NAME comes from the running server's environment.
export const dynamic = "force-dynamic";

/** Lets phones add the dashboard to the home screen with the brand's name, icon and colour. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: "AI customer support for businesses in the UAE",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#dc2626",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
