// Address of the Milo app (its own Next.js project in Desktop\Milo\web, port 5050).
// Every /products/milo/... request is handed to it, so Milo looks like part of this site
// (Next.js "multi-zones"). In production, set MILO_URL to wherever Milo is deployed.
const MILO_URL = (process.env.MILO_URL || "http://localhost:5050").replace(/\/$/, "");

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
    // Milo's page addresses end with "/", its files (scripts, images, sitemap.xml) do not.
    return [
      { source: "/products/milo/:file(.*\\.\\w+)", destination: `${MILO_URL}/products/milo/:file` },
      { source: "/products/milo/", destination: `${MILO_URL}/products/milo/` },
      { source: "/products/milo/:path+/", destination: `${MILO_URL}/products/milo/:path+/` },
    ];
  },
};

export default nextConfig;
