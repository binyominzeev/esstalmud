import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAmud, findTractate, neighbour, parseAmud, allAmudim } from "@/lib/talmud";
import DafView from "@/components/DafView";

type Params = Promise<{ tractate: string; daf: string; segment?: string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tractate, daf } = await params;
  const t = findTractate(tractate);
  return { title: t ? `${t.title} ${daf} – The Essentialist Talmud` : "The Essentialist Talmud" };
}

export default async function DafPage({ params }: { params: Params }) {
  const { tractate: slug, daf, segment } = await params;
  const tractate = findTractate(slug);
  const amud = tractate && parseAmud(tractate, daf);
  if (!tractate || !amud || (segment && (segment.length > 1 || !/^\d+$/.test(segment[0])))) notFound();

  let segments = null;
  let error: string | null = null;
  try {
    segments = await fetchAmud(tractate, daf);
  } catch (e) {
    error = e instanceof Error ? e.message : "Ismeretlen hiba";
  }

  return (
    <DafView
      key={`${slug}/${daf}`}
      tractate={tractate}
      daf={daf}
      prev={neighbour(tractate, amud, -1)}
      next={neighbour(tractate, amud, 1)}
      allDafim={allAmudim(tractate)}
      segments={segments}
      error={error}
      initialSegment={segment ? Number(segment[0]) : null}
    />
  );
}
