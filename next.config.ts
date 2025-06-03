import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    nodeMiddleware: true,
    ppr: true,
    reactCompiler: true,
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
