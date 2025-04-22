import Image from "next/image";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

const NavItems = [
    { name: "الرئيسية", href: "/" },
    { name: "المزايا", href: "/features" },
    { name: "كيف أبلفرها", href: "how to" },
    { name: "الأسئلة الشائعة", href: "/faq" },
    { name: "تواصل معنا", href: "/contact" },
]

const Navbar = () => {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar bg-white/10 backdrop-blur-md  border-b border-white/20 px-7 z-50">
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
                <Link href="/" className="hidden items-center gap-0.5 group lg:flex">
                    <button className="text-[#7f2dfb] font-bold cursor-pointer group-hover:text-[#012d46] transition-all duration-100">الدخول</button>
                    <ChevronLeft size={20} strokeWidth={1.75} className="text-[#7f2dfb] transition-all duration-200 group-hover:-translate-x-1 group-hover:text-[#012d46]" />
                </Link>
                <Link href="/">
                    <MainButton text="جرب مجاناً" bgColor="bg-[#7f2dfb]" textColor="text-white" className="hidden md:flex" />
                </Link>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden group flex items-center justify-center relative bg-[#7f2dfb] text-white z-10 [transition:all_.5s_ease-in-out] rounded-[0.375rem] p-[5px] cursor-pointer border border-[#999] outline-none focus-visible:outline-0"
                >
                    <svg
                        fill="currentColor"
                        stroke="none"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-7 h-7 overflow-visible [transition:transform_0.75s_ease-in-out] group-hover:[transition-delay:.25s]"
                    >
                        <path
                            className="transition-transform duration-700 ease-in-out group-hover:[transform:rotate(112.5deg)_translate(-27.2%,-80.2%)]"
                            d="m3.45,8.83c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31L14.71,2.08c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31L3.84,8.75c-.13.05-.25.08-.38.08Z"
                        ></path>
                        <path
                            className="transition-transform duration-700 ease-in-out group-hover:[transform:rotate(22.5deg)_translate(15.5%,-23%)]"
                            d="m2.02,17.13c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31L21.6,6.94c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31L2.4,17.06c-.13.05-.25.08-.38.08Z"
                        ></path>
                        <path
                            className="transition-transform duration-700 ease-in-out group-hover:[transform:rotate(112.5deg)_translate(-15%,-149.5%)]"
                            d="m8.91,21.99c-.39,0-.76-.23-.92-.62-.21-.51.03-1.1.54-1.31l11.64-4.82c.51-.21,1.1.03,1.31.54.21.51-.03,1.1-.54,1.31l-11.64,4.82c-.13.05-.25.08-.38.08Z"
                        ></path>
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
