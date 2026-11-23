import { SITE_URL } from '@/lib/site';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    ...(SITE_URL && { sitemap: `${SITE_URL}/sitemap.xml` }),
  };
}
