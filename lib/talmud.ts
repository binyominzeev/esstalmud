import { TRACTATES, type Tractate } from "./tractates";

export interface Segment {
  he: string;
  en: string;
}

export interface Amud {
  /** 1-based Sefaria section index: 1a = 1, 1b = 2, 2a = 3, ... */
  index: number;
  daf: number;
  side: "a" | "b";
}

export function findTractate(slug: string): Tractate | undefined {
  return TRACTATES.find((t) => t.slug === slug);
}

export function groupBySeder(): { seder: string; tractates: Tractate[] }[] {
  const groups: { seder: string; tractates: Tractate[] }[] = [];
  for (const t of TRACTATES) {
    const last = groups[groups.length - 1];
    if (last && last.seder === t.seder) last.tractates.push(t);
    else groups.push({ seder: t.seder, tractates: [t] });
  }
  return groups;
}

export function amudLabel(index: number): string {
  return `${Math.floor((index + 1) / 2)}${index % 2 === 1 ? "a" : "b"}`;
}

/** Parses "2a" into an Amud, or null if malformed or outside the tractate (which starts at 2a). */
export function parseAmud(tractate: Tractate, label: string): Amud | null {
  const m = /^(\d{1,3})([ab])$/.exec(label);
  if (!m) return null;
  const daf = Number(m[1]);
  const side = m[2] as "a" | "b";
  const index = daf * 2 - (side === "a" ? 1 : 0);
  if (daf < 2 || index > tractate.amudim) return null;
  return { index, daf, side };
}

export function neighbour(tractate: Tractate, amud: Amud, step: 1 | -1): string | null {
  const index = amud.index + step;
  if (index < 3 || index > tractate.amudim) return null;
  return amudLabel(index);
}

export function allAmudim(tractate: Tractate): string[] {
  const out: string[] = [];
  for (let i = 3; i <= tractate.amudim; i++) out.push(amudLabel(i));
  return out;
}

export function sefariaRef(tractate: Tractate, label: string, segment?: number): string {
  return `${tractate.title.replace(/ /g, "_")}.${label}${segment ? `.${segment}` : ""}`;
}

/** Sefaria text is HTML; keep only simple inline formatting and drop every attribute. */
function sanitize(html: string): string {
  return html
    .replace(/<(\/?)(b|strong|i|em|big|small|sup|sub|br)\b[^>]*>/gi, "\u0001$1$2\u0002")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, "&amp;")
    .replace(/\u0001(\/?)(\w+)\u0002/g, "<$1$2>");
}

export async function fetchAmud(tractate: Tractate, label: string): Promise<Segment[]> {
  const url = `https://www.sefaria.org/api/v3/texts/${sefariaRef(tractate, label)}?version=hebrew&version=english`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) throw new Error(`Sefaria responded ${res.status}`);
  const data: { versions: { language: string; text: string[] | string }[] } = await res.json();
  const pick = (lang: string) => {
    const t = data.versions.find((v) => v.language === lang)?.text ?? [];
    return Array.isArray(t) ? t : [t];
  };
  const he = pick("he");
  const en = pick("en");
  const n = Math.max(he.length, en.length);
  return Array.from({ length: n }, (_, i) => ({
    he: sanitize(String(he[i] ?? "")),
    en: sanitize(String(en[i] ?? "")),
  }));
}
