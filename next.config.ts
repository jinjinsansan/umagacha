import type { NextConfig } from "next";

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [];

const r2BaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? process.env.R2_PUBLIC_BASE_URL;

if (r2BaseUrl) {
  try {
    const parsed = new URL(r2BaseUrl);
    const protocol = parsed.protocol.replace(":", "");
    const hostname = parsed.hostname;
    const pathnameBase = parsed.pathname.replace(/\/$/, "");
    const pathname = pathnameBase ? `${pathnameBase}/**` : "/**";

    remotePatterns.push({
      protocol,
      hostname,
      pathname,
    });
  } catch (error) {
    console.warn("Invalid R2 base URL detected in next.config.ts", error);
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
