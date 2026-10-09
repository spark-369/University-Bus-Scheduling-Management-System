/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma and bcryptjs must be resolved at runtime (not bundled) so the
  // correct native query-engine binary is used on Vercel's serverless runtime.
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
    // Disable the client-side Router Cache. Without this, client-side
    // navigation between dashboard tabs could serve a cached segment and show
    // stale data until a full page refresh. Setting both to 0 forces every
    // navigation to re-fetch, so each tab always loads fresh data.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.tile.openstreetmap.org",
      },
    ],
  },
  // Avoid bundling Node-only built-ins into the browser bundle.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
