// Central site settings. Edit these values before going live.
// Text shown on the pages lives in src/dictionaries/it.json and en.json.

import { basePath } from "./base-path";
export { basePath };

// Public address of the AllMessage site (no path), same SITE_URL as the rest of the site. Milo lives under basePath.
export const siteUrl = (process.env.SITE_URL || "http://localhost:2060").trim().replace(/\/+$/, "");

export const site = {
  name: "Milo",
  // Legal details. Italian law requires company name and VAT number (P.IVA) on business websites.
  company: {
    legalName: "Nome Azienda S.r.l.",
    vatNumber: "IT00000000000",
    address: "Via Gustavo Fara 35, 20124 Milano MI",
    email: "sales@otech.one",
    privacyEmail: "privacy@example.com",
  },
  // Office address as shown in the footer ("Sedi"), one entry per line.
  officeLines: ["Via Gustavo Fara 35,", "20124 Milano MI"],
  social: {
    // Full profile URLs, used in structured data (sameAs). Leave empty if not used.
    linkedin: "",
    instagram: "",
  },
  themeColor: "#0bd0c9",
  // The One Tech website (a different domain from this site, so full addresses).
  oneTech: {
    products: "https://www.otech.one/products/",
  },
  // Date the legal pages were last updated (shown on privacy and cookie pages).
  legalUpdated: "2026-11-05",
} as const;

export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "it";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

// Pages that exist in every language. Used by the sitemap and hreflang tags.
export const pages = ["", "/privacy", "/cookie-policy"] as const;
export type PagePath = (typeof pages)[number];

/** Address of a Milo page on the site. Italian has no language prefix:
 *  "/products/milo/" and "/products/milo/privacy/" are Italian, "/products/milo/en/..." English.
 *  (next.config.mjs serves the Italian addresses from the [lang] = "it" pages.) */
export function localePath(lang: Locale, path: string = "") {
  const p = basePath + (lang === defaultLocale ? path : `/${lang}${path}`);
  return p.endsWith("/") ? p : `${p}/`;
}

/** Full public URL of a page, e.g. https://example.com/products/milo/en/privacy/ */
export const absoluteUrl = (lang: Locale, path: string = "") => `${siteUrl}${localePath(lang, path)}`;

/** Canonical URL plus hreflang alternates for one page. */
export function alternatesFor(lang: Locale, path: PagePath) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = absoluteUrl(l, path);
  languages["x-default"] = absoluteUrl(defaultLocale, path);
  return { canonical: absoluteUrl(lang, path), languages };
}

export const ogLocale: Record<Locale, string> = { it: "it_IT", en: "en_US" };

/** Social-preview image of a language: /products/milo/og/it.png (app/(milo)/products/milo/og/[file]/route.tsx).
 *  A file-style address, so it loads straight away with no trailing-slash redirect. */
export const ogImage = (lang: Locale) => ({ url: `${basePath}/og/${lang}.png`, width: 1200, height: 630, alt: site.name });

/** Open Graph fields every page needs. Next.js replaces (not merges) openGraph per page, so pages spread this in. */
export function ogBase(lang: Locale) {
  return {
    type: "website" as const,
    siteName: site.name,
    locale: ogLocale[lang],
    alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
    images: [ogImage(lang)],
  };
}
