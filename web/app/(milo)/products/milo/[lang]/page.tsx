import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@milo/lib/dictionaries";
import { absoluteUrl, alternatesFor, hasLocale, ogBase, site } from "@milo/lib/site";
import { JsonLd } from "@milo/components/JsonLd";
import { HeroWall } from "@milo/components/hero/HeroWall";
import { Audience } from "@milo/components/blocks/Audience";
import { RulesFlow } from "@milo/components/blocks/RulesFlow";
import { Capabilities } from "@milo/components/blocks/Capabilities";
import { Platform } from "@milo/components/blocks/Platform";
import { About } from "@milo/components/blocks/About";

export async function generateMetadata({ params }: PageProps<"/products/milo/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: { absolute: dict.meta.title },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    alternates: alternatesFor(lang, ""),
    openGraph: { ...ogBase(lang), title: dict.meta.title, description: dict.meta.description, url: absoluteUrl(lang) },
  };
}

export default async function Home({ params }: PageProps<"/products/milo/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: site.name,
    description: dict.meta.description,
    url: absoluteUrl(lang),
    brand: { "@type": "Brand", name: "One Tech" },
  };
  // Breadcrumb: Products (on the One Tech website) › Milo
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.nav.products, item: site.oneTech.products },
      { "@type": "ListItem", position: 2, name: "Milo", item: absoluteUrl(lang) },
    ],
  };

  return (
    <>
      {/* Every page needs one <h1> for search engines and screen readers. The logo is the visible
          heading here, so the text version is visually hidden. */}
      <h1 className="sr-only">{dict.meta.title}</h1>
      <HeroWall text={dict.hero.wall} />
      <Audience audience={dict.audience} />
      <RulesFlow different={dict.different} />
      <Capabilities capabilities={dict.capabilities} />
      <Platform platform={dict.platform} />
      <About about={dict.about} />
      <JsonLd data={structuredData} />
      <JsonLd data={breadcrumb} />
    </>
  );
}
