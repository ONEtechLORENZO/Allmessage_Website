import type { MetadataRoute } from "next";
import { alternatesFor, locales, pages, site } from "@milo/lib/site";

// Served at /sitemap.xml. Lists every page in every language, with hreflang alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((path) =>
    locales.map((lang) => {
      const { canonical, languages } = alternatesFor(lang, path);
      return {
        url: canonical,
        lastModified: path === "" ? undefined : site.legalUpdated,
        changeFrequency: path === "" ? "weekly" : "yearly",
        priority: path === "" ? 1 : 0.3,
        alternates: { languages },
      };
    }),
  );
}
