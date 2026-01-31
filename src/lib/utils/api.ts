import { publicEnv } from "@/lib/env";

export function resolveApiUrl(path: string) {
  if (typeof window === "undefined") {
    const origin = publicEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return `${origin}${path}`;
  }

  return path;
}
