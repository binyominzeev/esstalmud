import { redirect, notFound } from "next/navigation";
import { findTractate } from "@/lib/talmud";

export default async function TractateIndex({ params }: { params: Promise<{ tractate: string }> }) {
  const { tractate } = await params;
  if (!findTractate(tractate)) notFound();
  redirect(`/${tractate}/2a`);
}
