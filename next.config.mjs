/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // We explicitly enable the static export mode. When running `next export`,
  // Next.js will pre‑render each page into HTML at build time so the site can
  // be hosted on GitHub Pages or any static host.  See: https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
  output: 'export',
};

export default nextConfig;
