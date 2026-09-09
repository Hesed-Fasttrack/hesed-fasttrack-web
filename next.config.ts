import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE.md is our private working agreement — never let Next regenerate it
  agentRules: false,
};

export default nextConfig;
