export type KopisShow = {
  mt20id: string;
  prfnm: string;
  prfpdfrom: string;
  prfpdto: string;
  fcltynm: string;
  poster: string;
  area: string;
  genrenm: string;
  openrun: string;
  prfstate: string;
};

export type KopisShowDetail = KopisShow & {
  mt10id?: string;
  mt13id?: string;
  prfcast?: string;
  prfcrew?: string;
  prfruntime?: string;
  prfage?: string;
  entrpsnm?: string;
  entrpsnmP?: string;
  entrpsnmA?: string;
  entrpsnmH?: string;
  entrpsnmS?: string;
  pcseguidance?: string;
  sty?: string;
  dtguidance?: string;
  relates?: { relatenm: string; relateurl: string }[];
};

const BASE = 'http://www.kopis.or.kr/openApi/restful';

function textBetween(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match?.[1]?.trim() ?? '';
}

function decodeXml(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function parseDbBlocks(xml: string) {
  return [...xml.matchAll(/<db>([\s\S]*?)<\/db>/g)].map((m) => m[1]);
}

function ensureKey() {
  const key = process.env.KOPIS_API_KEY;
  if (!key) throw new Error('KOPIS_API_KEY is not configured');
  return key;
}

export function formatYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export async function getKopisShows(options?: {
  start?: Date;
  end?: Date;
  page?: number;
  rows?: number;
  genre?: string;
  areaCode?: string;
  venue?: string;
  performanceName?: string;
  state?: string;
}): Promise<KopisShow[]> {
  const key = ensureKey();
  const start = options?.start ?? new Date();
  const maxEnd = new Date(start);
  maxEnd.setDate(maxEnd.getDate() + 30); // KOPIS 목록 API: 최대 31일 범위
  const requestedEnd = options?.end ?? maxEnd;
  const end = requestedEnd > maxEnd ? maxEnd : requestedEnd;

  const q = new URLSearchParams({
    service: key,
    stdate: formatYYYYMMDD(start),
    eddate: formatYYYYMMDD(end),
    cpage: String(options?.page ?? 1),
    rows: String(Math.min(options?.rows ?? 20, 100)),
  });
  if (options?.genre) q.set('shcate', options.genre);
  if (options?.areaCode) q.set('signgucode', options.areaCode);
  if (options?.venue) q.set('shprfnmfct', options.venue);
  if (options?.performanceName) q.set('shprfnm', options.performanceName);
  if (options?.state) q.set('prfstate', options.state);

  const res = await fetch(`${BASE}/pblprfr?${q.toString()}`, {
    next: { revalidate: 60 * 30 },
  });
  if (!res.ok) throw new Error(`KOPIS list request failed: ${res.status}`);
  const xml = await res.text();

  return parseDbBlocks(xml).map((b) => ({
    mt20id: textBetween(b, 'mt20id'),
    prfnm: decodeXml(textBetween(b, 'prfnm')),
    prfpdfrom: textBetween(b, 'prfpdfrom'),
    prfpdto: textBetween(b, 'prfpdto'),
    fcltynm: decodeXml(textBetween(b, 'fcltynm')),
    poster: textBetween(b, 'poster'),
    area: decodeXml(textBetween(b, 'area')),
    genrenm: decodeXml(textBetween(b, 'genrenm')),
    openrun: textBetween(b, 'openrun'),
    prfstate: decodeXml(textBetween(b, 'prfstate')),
  }));
}

export async function getKopisShowDetail(id: string): Promise<KopisShowDetail> {
  const key = ensureKey();
  const res = await fetch(`${BASE}/pblprfr/${encodeURIComponent(id)}?service=${encodeURIComponent(key)}`, {
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) throw new Error(`KOPIS detail request failed: ${res.status}`);
  const xml = await res.text();
  const block = parseDbBlocks(xml)[0];
  if (!block) throw new Error('KOPIS detail response is empty');

  const relateBlock = block.match(/<relates>([\s\S]*?)<\/relates>/)?.[1] ?? '';
  const relates = [...relateBlock.matchAll(/<relate>([\s\S]*?)<\/relate>/g)].map((m) => ({
    relatenm: decodeXml(textBetween(m[1], 'relatenm')),
    relateurl: decodeXml(textBetween(m[1], 'relateurl')),
  }));

  return {
    mt20id: textBetween(block, 'mt20id'),
    prfnm: decodeXml(textBetween(block, 'prfnm')),
    prfpdfrom: textBetween(block, 'prfpdfrom'),
    prfpdto: textBetween(block, 'prfpdto'),
    fcltynm: decodeXml(textBetween(block, 'fcltynm')),
    poster: textBetween(block, 'poster'),
    area: decodeXml(textBetween(block, 'area')),
    genrenm: decodeXml(textBetween(block, 'genrenm')),
    openrun: textBetween(block, 'openrun'),
    prfstate: decodeXml(textBetween(block, 'prfstate')),
    mt10id: textBetween(block, 'mt10id'),
    mt13id: textBetween(block, 'mt13id'),
    prfcast: decodeXml(textBetween(block, 'prfcast')),
    prfcrew: decodeXml(textBetween(block, 'prfcrew')),
    prfruntime: decodeXml(textBetween(block, 'prfruntime')),
    prfage: decodeXml(textBetween(block, 'prfage')),
    entrpsnm: decodeXml(textBetween(block, 'entrpsnm')),
    entrpsnmP: decodeXml(textBetween(block, 'entrpsnmP')),
    entrpsnmA: decodeXml(textBetween(block, 'entrpsnmA')),
    entrpsnmH: decodeXml(textBetween(block, 'entrpsnmH')),
    entrpsnmS: decodeXml(textBetween(block, 'entrpsnmS')),
    pcseguidance: decodeXml(textBetween(block, 'pcseguidance')),
    sty: decodeXml(textBetween(block, 'sty')),
    dtguidance: decodeXml(textBetween(block, 'dtguidance')),
    relates,
  };
}
