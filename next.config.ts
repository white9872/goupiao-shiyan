import type { NextConfig } from "next";

// Tauri bundles static assets. Use Next "export" mode so the frontend is fully static.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
