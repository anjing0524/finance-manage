/** @type {import('next').NextConfig} */
const path = require('path');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const nextConfig = {
  reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
  // serverComponentsExternalPackages: ["@prisma/client", "bcrypt"]
  output: 'standalone',
  webpack(config, options) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    config.plugins.push(
      new WasmPackPlugin({
        crateDirectory: path.resolve(__dirname, './finance-cal'), // path to your Rust crate
        outDir: path.resolve(__dirname, './finance-cal/pkg'), // output directory
        forceMode: 'production',
      }),
    );

    return config;
  },
};

module.exports = nextConfig;
