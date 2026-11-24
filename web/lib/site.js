// Public address of the site, e.g. https://allmessage.otech.one (set SITE_URL, see .env.example).
// Until it is set, the canonical, sitemap and JSON-LD addresses are left out instead of pointing at localhost.
const configured = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");

export const SITE_URL = configured || null;

// Only used to build the social-preview image address while SITE_URL is unset.
export const METADATA_BASE = new URL(SITE_URL || "http://localhost:2060");

export const SITE_NAME = "AllMessage";

// Page addresses end with "/" (trailingSlash: true in next.config.mjs).
export const PATHS = { it: "/", en: "/en/" };

/** Metadata shared by the Italian and English layouts. */
export function pageMetadata(lang, { title, description }) {
  const og = { url: "/og-image.png", width: 1200, height: 630, alt: title };
  return {
    metadataBase: METADATA_BASE,
    title,
    description,
    applicationName: SITE_NAME,
    ...(SITE_URL && {
      alternates: {
        canonical: PATHS[lang],
        languages: { it: PATHS.it, en: PATHS.en, "x-default": PATHS.it },
      },
    }),
    openGraph: {
      type: "website",
      locale: lang === "en" ? "en_US" : "it_IT",
      alternateLocale: lang === "en" ? "it_IT" : "en_US",
      siteName: SITE_NAME,
      title,
      description,
      images: [og],
      ...(SITE_URL && { url: PATHS[lang] }),
    },
    twitter: { card: "summary_large_image", title, description, images: [og.url] },
  };
}

/** Structured data for search engines, taken from the page itself (footer, copy). */
export function jsonLd(lang, description) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.otech.one/#organization",
        name: "One Tech",
        url: "https://www.otech.one/",
        logo: SITE_URL ? `${SITE_URL}/brand/onetech-logo-dark.png` : undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Via Gustavo Fara 35",
          postalCode: "20124",
          addressLocality: "Milano",
          addressRegion: "MI",
          addressCountry: "IT",
        },
        contactPoint: { "@type": "ContactPoint", contactType: "sales", email: "sales@otech.one", availableLanguage: ["it", "en"] },
        sameAs: [
          "https://www.linkedin.com/company/otech-one/",
          "https://www.instagram.com/onetech.one/",
          "https://www.youtube.com/@Onetech22",
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: lang,
        publisher: { "@id": "https://www.otech.one/#organization" },
        ...(SITE_URL && { url: `${SITE_URL}${PATHS[lang]}` }),
      },
    ],
  };
}
