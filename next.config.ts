import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Os testes E2E usam uma pasta própria para rodar ao lado do `next dev` normal
  distDir: process.env.NEXT_DIST_DIR || ".next",
}

export default nextConfig
