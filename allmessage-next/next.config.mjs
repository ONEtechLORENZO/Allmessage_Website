/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep Turbopack scoped to this folder (a package-lock.json higher up would confuse it).
  turbopack: { root: import.meta.dirname },
  // Let the dev server be opened from other devices on the office network.
  allowedDevOrigins: ['192.168.0.17'],
};

export default nextConfig;
