import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true, parseTagValue: false });

export async function fetchJson<T = unknown>(url: string, revalidate = 900): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchXml(url: string, revalidate = 900): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parser.parse(await res.text());
}

export function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function publicDataKey(...names: string[]) {
  let value = "";

  for (const name of names) {
    if (process.env[name]) {
      value = process.env[name]!;
      break;
    }
  }

  if (!value) {
    value = process.env.DATA_GO_KR_SERVICE_KEY || "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function buildUrl(base: string, params: Record<string, string | number | undefined | null>) {
  const u = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    u.searchParams.set(key, String(value));
  }
  return u.toString();
}
