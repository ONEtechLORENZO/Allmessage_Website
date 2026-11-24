import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@milo/lib/dictionaries";
import { absoluteUrl, alternatesFor, hasLocale, ogBase } from "@milo/lib/site";
import { LegalPage } from "@milo/components/LegalPage";

export async function generateMetadata({ params }: PageProps<"/products/milo/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { legal } = await getDictionary(lang);
  return {
    title: legal.privacy.title,
    description: legal.privacy.description,
    alternates: alternatesFor(lang, "/privacy"),
    openGraph: { ...ogBase(lang), title: legal.privacy.title, description: legal.privacy.description, url: absoluteUrl(lang, "/privacy") },
  };
}

export default async function PrivacyPage({ params }: PageProps<"/products/milo/[lang]/privacy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { legal } = await getDictionary(lang);
  return <LegalPage lang={lang} title={legal.privacy.title} updatedLabel={legal.updated} sections={legal.privacy.sections} />;
}
