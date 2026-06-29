/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // @privy-io/react-auth references an optional Solana mini-app connector that
    // this EVM-only example doesn't use and isn't installed. Stub it so the
    // bundler doesn't fail to resolve it.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@farcaster/mini-app-solana": false,
    };
    return config;
  },
};

export default nextConfig;
