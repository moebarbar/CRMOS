/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
    typedRoutes: true,
  },
  transpilePackages: ['@chiefos/db', '@chiefos/shared', '@chiefos/emails'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
    ],
  },
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;
