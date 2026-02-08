import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  images: {
    domains: [], // Coolify configurará dominios permitidos
  },
  env: {
    // Variables que Next.js necesita en tiempo de build
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Para producción, usar basePath si es necesario
  basePath: '',
  assetPrefix: '',
};

export default nextConfig;
