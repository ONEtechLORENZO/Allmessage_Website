if (process.env.NODE_ENV === "production" && !process.env.SITE_URL) {
  console.warn("[seo] SITE_URL is not set: canonical URL, sitemap and social-preview address are incomplete. See .env.example.");
}

// Address of the Milo app (its own Next.js project). Every /products/milo/... request is handed to it,
// so Milo looks like part of this site (Next.js "multi-zones").
// Milo is switched on only when MILO_URL is set: without it there are no rewrites (so /products/milo/
// is a 404) and the pages carry no Milo links (app/_home/markup.js). For local work put
// MILO_URL=http://localhost:5050 in .env.local.
const MILO_URL = (process.env.MILO_URL || "").trim().replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Same as Milo (addresses end with "/"), otherwise the two apps redirect back and forth.
  trailingSlash: true,
  devIndicators: false,
  turbopack: { root: import.meta.dirname },
  // The Italian (/) and English (/en/) pages each have their own <html lang>, so 404s need their own page.
  experimental: { globalNotFound: true },
  // Lets people on the same Wi-Fi open the dev server via this PC's address.
  allowedDevOrigins: ["192.168.0.17", "192.168.*.*", "10.*.*.*"],
  // Old links to the single-file version open the homepage.
  async redirects() {
    return [{ source: "/:file(AllMessage_offline.*\\.html)", destination: "/", permanent: true }];
  },
  async rewrites() {
    if (!MILO_URL) return [];
    // Milo's page addresses end with "/", its files (scripts, images, sitemap.xml) do not.
    return [
      { source: "/products/milo/:file(.*\\.\\w+)", destination: `${MILO_URL}/products/milo/:file` },
      { source: "/products/milo/", destination: `${MILO_URL}/products/milo/` },
      { source: "/products/milo/:path+/", destination: `${MILO_URL}/products/milo/:path+/` },
    ];
  },
};

export default nextConfig;
