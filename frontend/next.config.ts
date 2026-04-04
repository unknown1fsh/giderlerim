import type { NextConfig } from "next";
import path from "path";

/** Depo kökü (frontend/ ve packages/shared/ burada). `next build` çalışma dizini frontend olduğu için cwd üst dizindir. */
const monorepoRoot = path.resolve(process.cwd(), "..");

/** Monorepo: shared paketi kendi node_modules'ünde ikinci bir react-query kurabiliyor; Context farklı kopyada kalır → "No QueryClient set". */
const reactQueryPkg = path.resolve(process.cwd(), "node_modules/@tanstack/react-query");
const reactPkg = path.resolve(process.cwd(), "node_modules/react");
const reactDomPkg = path.resolve(process.cwd(), "node_modules/react-dom");

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
      react: reactPkg,
      "react-dom": reactDomPkg,
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
      react: turboRelative(reactPkg),
      "react-dom": turboRelative(reactDomPkg),
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
