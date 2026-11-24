import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@milo/lib/dictionaries";
import { absoluteUrl, alternatesFor, hasLocale, ogBase } from "@milo/lib/site";
import { LegalPage } from "@milo/components/LegalPage";

export async function generateMetadata({ params }: PageProps<"/products/milo/[lang]/cookie-policy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { legal } = await getDictionary(lang);
  return {
    title: legal.cookies.title,
    description: legal.cookies.description,
    alternates: alternatesFor(lang, "/cookie-policy"),
    openGraph: { ...ogBase(lang), title: legal.cookies.title, description: legal.cookies.description, url: absoluteUrl(lang, "/cookie-policy") },
  };
}

export default async function CookiePolicyPage({ params }: PageProps<"/products/milo/[lang]/cookie-policy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { legal } = await getDictionary(lang);
  return <LegalPage lang={lang} title={legal.cookies.title} updatedLabel={legal.updated} sections={legal.cookies.sections} />;
}
