import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	webpack: (config) => {
		config.resolve = {
			...(config.resolve || {}),
			alias: {
				...(config.resolve?.alias || {}),
				"@components": path.resolve(__dirname, "src/components"),
			},
		};
		return config;
	},
};

export default nextConfig;
