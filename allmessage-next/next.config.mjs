if (process.env.NODE_ENV === 'production' && !process.env.SITE_URL) {
  console.warn('[seo] SITE_URL is not set: canonical URL, sitemap and social-preview image URL are incomplete. See .env.example.');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep Turbopack scoped to this folder (a package-lock.json higher up would confuse it).
  turbopack: { root: import.meta.dirname },
  // Let the dev server be opened from other devices on the office network.
  allowedDevOrigins: ['192.168.0.17'],
};

export default nextConfig;
