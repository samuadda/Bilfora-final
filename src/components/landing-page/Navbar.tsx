import Image from "next/image";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { SendIcon , ChevronLeft } from "lucide-react";

const NavItems = [
    { name: "الرئيسية", href: "/" },
    { name: "المزايا", href: "/" },
    { name: "كيف أبلفرها", href: "/" },
    { name: "الأسئلة الشائعة", href: "/" },
    { name: "تواصل معنا", href: "/" },
]

const Navbar = () => {
    return (
        <div className="sticky navbar bg-white/10 backdrop-blur-md shadow border-b border-white/20 px-7 z-50">
            <div className="navbar-start">
                {/* logo */}
                <Link href="/">
                    <Image src="logo-ar-navy.svg" alt="logo" width={70} height={40} />
                </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 text-gray-800">
                    {NavItems.map(item => (
                        <li key={item.name} className="text-gray-800 hover:text-blue-600">
                            <Link href={item.href}>{item.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="navbar-end flex items-center gap-2">
                <Link href="/" className="flex items-center gap-0.5">
                    <button className="text-[#7f2dfb] font-medium cursor-pointer hover:text-[#012d46] transition-all duration-200">الدخول</button>
                    <ChevronLeft size={20} color="#7f2dfb" strokeWidth={1.75} className="hover:right-1.5" />
                </Link>
                <Link href="/">
                    <MainButton
                        text="جرب مجاناً"
                        bgColor="bg-[#7f2dfb]"
                        textColor="text-white"
                        shadowColor="#ff5291" // indigo-500 base
                        className="mt-6"
                    />
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
