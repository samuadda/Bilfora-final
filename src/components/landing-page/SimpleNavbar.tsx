import Image from "next/image";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

const SimpleNavbar = () => {
	return (
		<>
			<motion.nav
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				className="fixed top-0 navbar bg-white/10 backdrop-blur-md  border-b border-white/20 px-7 z-50"
			>
				<div className="navbar-start">
					{/* logo */}
					<Link href="/">
						<Image
							src="/logo-full.svg"
							alt="Bilfora"
							width={140}
							height={40}
						/>
					</Link>
				</div>

				<div className="navbar-end flex items-center gap-2">
					<Link
						href="/dashboard"
						className="hidden items-center gap-0.5 group lg:flex"
					>
						<button className="text-[#7f2dfb] font-bold cursor-pointer group-hover:text-[#012d46] transition-all duration-100">
							الدخول
						</button>
						<ChevronLeft
							size={20}
							strokeWidth={1.75}
							className="text-[#7f2dfb] transition-all duration-200 group-hover:-translate-x-1 group-hover:text-[#012d46]"
						/>
					</Link>
					<Link href="/register">
						<MainButton
							text="جرب مجاناً"
							bgColor="bg-[#7f2dfb]"
							textColor="text-white"
							className="hidden md:flex"
						/>
					</Link>
				</div>
			</motion.nav>
		</>
	);
};

export default SimpleNavbar;
