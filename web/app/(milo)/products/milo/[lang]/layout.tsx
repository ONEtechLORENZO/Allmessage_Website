import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "@milo/milo.css";
import { getDictionary } from "@milo/lib/dictionaries";
import { basePath, hasLocale, locales, ogBase, ogImage, site, siteUrl } from "@milo/lib/site";
import { Header } from "@milo/components/Header";
import { Footer } from "@milo/components/Footer";
import { CookieConsent } from "@milo/components/CookieConsent";
import { JsonLd } from "@milo/components/JsonLd";
import Script from "next/script";

// Same font file as the AllMessage pages (Sora, open font license)
const sora = localFont({ src: "../../../../../public/fonts/Sora.ttf", weight: "100 800", variable: "--font-sora", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/products/milo/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: `%s | ${site.name}` },
    description: dict.meta.description,
    applicationName: site.name,
    // home-screen icon (the "milo" wordmark on aqua); a static file, so the base path is added by hand
    icons: { icon: { url: `${basePath}/icon.svg`, type: "image/svg+xml" }, apple: { url: `${basePath}/img/apple-touch-icon.png`, sizes: "180x180", type: "image/png" } },
    openGraph: ogBase(lang),
    twitter: { card: "summary_large_image", images: [ogImage(lang).url] },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: site.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({ children, params }: LayoutProps<"/products/milo/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const sameAs = Object.values(site.social).filter(Boolean);
  const organization = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: site.company.name,
        url: siteUrl,
        logo: `${siteUrl}${basePath}/icon.svg`,
        email: site.company.email,
        address: site.company.address,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: site.name,
        url: siteUrl,
        inLanguage: locales,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang={lang} className={`${sora.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-contrast"
        >
          {dict.nav.skip}
        </a>
        <Header lang={lang} dict={dict} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} dict={dict} />
        <CookieConsent
          lang={lang}
          text={dict.cookieBanner}
          gaId={process.env.NEXT_PUBLIC_GA_ID ?? ""}
        />
        <JsonLd data={organization} />
        {/* WhatsApp button + "Richiedi Demo" form, shared with the AllMessage homepage */}
        <link rel="stylesheet" href="/demo-kit/demo.css" precedence="default" />
        <Script src="/js/demo-kit.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
