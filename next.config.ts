import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        '*.app.github.dev', // Allow GitHub Codespaces domains
        '*.githubpreview.dev', // Allow GitHub Codespaces preview domains
      ]
    }
  }
};

export default nextConfig;