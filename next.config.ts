import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Required for Cloudflare Pages / OpenNext */
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
