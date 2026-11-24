import { SITE_URL } from "../lib/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    // Milo (served at /products/milo/ only when MILO_URL is set) publishes its own sitemap.
    ...(SITE_URL && {
      sitemap: [`${SITE_URL}/sitemap.xml`, ...(process.env.MILO_URL ? [`${SITE_URL}/products/milo/sitemap.xml`] : [])],
    }),
  };
}
