import type { NextConfig } from "next";
import path from "path";

/** Depo kökü (frontend/ ve packages/shared/ burada). `next build` çalışma dizini frontend olduğu için cwd üst dizindir. */
const monorepoRoot = path.resolve(process.cwd(), "..");

/** Monorepo: shared altında ikinci @tanstack/react-query → "No QueryClient set". React'a alias vermeyin (SSR/prerender'da çift React riski). */
const reactQueryPkg = path.resolve(process.cwd(), "node_modules/@tanstack/react-query");

/** Turbopack (özellikle Windows) mutlak disk yolunu alias değeri olarak desteklemiyor; kök `monorepoRoot` olduğundan göreli yol verilir. */
function turboRelative(abs: string): string {
  const rel = path.relative(monorepoRoot, abs).split(path.sep).join("/");
  return rel.startsWith(".") ? rel : `./${rel}`;
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@giderlerim/shared"],
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tanstack/react-query": reactQueryPkg,
    };
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    root: monorepoRoot,
    resolveAlias: {
      "@tanstack/react-query": turboRelative(reactQueryPkg),
    },
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
