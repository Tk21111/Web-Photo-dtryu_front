import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images : {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
        search: '',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'https://meow.printhelloworld.xyz',
        port: '',
        pathname: '**',
        search: '',
      },
    ],
  }
};

export default nextConfig;
