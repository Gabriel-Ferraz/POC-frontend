import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Removed cacheComponents as it conflicts with route-level dynamic config
	// Data caching is handled via cachedQuery wrapper with unstable_cache
};

export default nextConfig;
