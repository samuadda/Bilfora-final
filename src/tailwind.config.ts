import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./app/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-vazirmatn)"],
            },
        },
    },
    plugins: [],
};

export default config;
