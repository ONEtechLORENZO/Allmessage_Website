import { SITE_URL } from '@/lib/site';

// Single-page site. Empty until SITE_URL is set, so no wrong absolute URLs are published.
export default function sitemap() {
  return SITE_URL ? [{ url: `${SITE_URL}/` }] : [];
}
