import { PATHS, SITE_URL } from "../lib/site";

// Italian and English homepages. Empty until SITE_URL is set, so no wrong absolute addresses are published.
export default function sitemap() {
  if (!SITE_URL) return [];
  const languages = { it: `${SITE_URL}${PATHS.it}`, en: `${SITE_URL}${PATHS.en}` };
  return Object.values(languages).map((url) => ({ url, alternates: { languages } }));
}
