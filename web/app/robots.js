import { SITE_URL } from "../lib/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    // Milo (served at /products/milo/) publishes its own sitemap.
    ...(SITE_URL && { sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/products/milo/sitemap.xml`] }),
  };
}
