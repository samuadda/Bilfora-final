import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const vazirmatn = Vazirmatn({
	subsets: ["arabic"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-vazirmatn",
	display: "swap",
});

export const metadata: Metadata = {
	title: "بيلفورة",
	description: "فواتير احترافية جذابة وسريعة.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ar" dir="rtl" className="scroll-smooth">
			<body className={`${vazirmatn.className} font-sans antialiased`}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
