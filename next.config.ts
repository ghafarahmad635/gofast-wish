import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ufs.sh", // ✅ allows all UploadThing subdomains
      },
    ],
  },
};

export default nextConfig;
