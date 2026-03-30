import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    // "http://192.168.1.28:3000",
    // "http://192.168.88.248:3000",
    "http://*.local:3000",
    "http://0.0.0.0:3000",
  ],
};

export default nextConfig;
