const CDN_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

function normalizePath(path: string) {
  return path.replace(/^\//, "");
}

export function buildAssetUrl(path: string) {
  const normalized = normalizePath(path);
  if (CDN_BASE) {
    return `${CDN_BASE}/${normalized}`;
  }
  return `/${normalized}`;
}

export function resolveMediaUrl(input?: string | null) {
  if (!input) return input ?? null;
  if (/^https?:\/\//i.test(input)) {
    return input;
  }
  return buildAssetUrl(input);
}
