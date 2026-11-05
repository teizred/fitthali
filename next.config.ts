import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Le dossier personnel contient un package.json parasite : on fixe la racine du projet.
  turbopack: { root: path.resolve(".") },
  outputFileTracingRoot: path.resolve("."),
};

export default nextConfig;
