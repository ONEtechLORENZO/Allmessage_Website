if (process.env.NODE_ENV === "production" && !process.env.SITE_URL) {
  console.warn("[seo] SITE_URL is not set: canonical URL, sitemap and social-preview address are incomplete. See .env.example.");
}

// Milo is a page of this site (/products/milo/, code in milo/ and app/(milo)/).
// Its pages are built per language under /products/milo/it/ and /products/milo/en/;
// the Italian ones are shown at the short address without "it/".
const MILO_IT = ["", "privacy/", "cookie-policy/"];

// Security headers Milo always sent (it used to be its own app).
const miloHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Every page address ends with "/".
  trailingSlash: true,
  devIndicators: false,
  turbopack: {
    root: import.meta.dirname,
    // Tailwind CSS runs only on Milo's styles (milo/), never on the AllMessage CSS.
    rules: {
      "*.css": { condition: { path: /^milo\// }, loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  // The Italian (/) and English (/en/) pages each have their own <html lang>, so 404s need their own page.
  experimental: { globalNotFound: true },
  // Lets people on the same Wi-Fi open the dev server via this PC's address.
  allowedDevOrigins: ["192.168.0.17", "192.168.*.*", "10.*.*.*"],
  // Old links to the single-file version open the homepage.
  // Milo: /products/milo/it/... has one address only, the short Italian one.
  async redirects() {
    return [
      { source: "/:file(AllMessage_offline.*\\.html)", destination: "/", permanent: true },
      { source: "/products/milo/it/", destination: "/products/milo/", permanent: true },
      { source: "/products/milo/it/:path+", destination: "/products/milo/:path+/", permanent: true },
    ];
  },
  async rewrites() {
    return MILO_IT.map((p) => ({ source: `/products/milo/${p}`, destination: `/products/milo/it/${p}` }));
  },
  async headers() {
    return [{ source: "/products/milo/:path*", headers: miloHeaders }];
  },
};

export default nextConfig;
