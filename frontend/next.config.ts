import type { NextConfig } from "next";
import path from "path";

/** Depo kökü (frontend/ ve packages/shared/ burada). `next build` çalışma dizini frontend olduğu için cwd üst dizindir. */
const monorepoRoot = path.resolve(process.cwd(), "..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@giderlerim/shared"],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    root: monorepoRoot,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8081/api/:path*",
      },
    ];
  },
};

export default nextConfig;
