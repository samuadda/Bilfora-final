import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatar.vercel.sh",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "pjiwbmrmqnpppwyfmiev.supabase.co",
				port: "",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
