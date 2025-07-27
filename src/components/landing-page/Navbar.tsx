import Image from "next/image";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {NavigationMenu} from "@/components/landing-page/MobileMenu";

const NavItems = [
    { name: "الرئيسية", href: "#home" },
    { name: "المزايا", href: "#features" },
    { name: "كيف أبلفرها", href: "#how-to" },
    { name: "الأسئلة الشائعة", href: "/faq" },
    { name: "تواصل معنا", href: "/contact" },
]

const Navbar = () => {
    const pathname = usePathname();

    return (
        <>
            <motion.nav initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="fixed top-0 navbar bg-white/10 backdrop-blur-md  border-b border-white/20 px-7 z-50">
                <div className="navbar-start">
                    {/* logo */}
                    <Link href="/">
                        <Image src="logo-ar-navy.svg" alt="logo" width={70} height={20} />
                    </Link>
                </div>

                <div className="navbar-center hidden md:flex">
                    <ul className="menu menu-horizontal px-1 text-gray-800">
                        {NavItems.map(item => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name} className={cn("font-bold px-3", isActive ? "bg-gray-100 rounded-4xl border" : "text-gray-800 hover:text-gray-500")}>
                                    <Link href={item.href}>{item.name}</Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="navbar-end flex items-center gap-2">
                    <Link href="/dashboard" className="hidden items-center gap-0.5 group lg:flex">
                        <button className="text-[#7f2dfb] font-bold cursor-pointer group-hover:text-[#012d46] transition-all duration-100">الدخول</button>
                        <ChevronLeft size={20} strokeWidth={1.75} className="text-[#7f2dfb] transition-all duration-200 group-hover:-translate-x-1 group-hover:text-[#012d46]" />
                    </Link>
                    <Link href="/register">
                        <MainButton text="جرب مجاناً" bgColor="bg-[#7f2dfb]" textColor="text-white" className="hidden md:flex" />
                    </Link>
                </div>
            </motion.nav>
            <NavigationMenu NavItems={NavItems} MainButtonText="جرب مجانأ" />
        </>
    );
};

export default Navbar;
