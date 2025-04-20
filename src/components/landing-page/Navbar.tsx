import Image from "next/image";
import Link from "next/link";
import {ShimmerButton} from "@/components/shimmer-button";

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
                    <Image src="logo-ar.svg" alt="logo" width={100} height={40} />
                </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 text-gray-800">
                    {NavItems.map((item) => (
                        <li key={item.name} className="text-gray-800 hover:text-blue-600">
                            <Link href={item.href}>{item.name}</Link>
                        </li>))}
                </ul>
            </div>
            <div className="navbar-end">
                <Link href="/">
                    <ShimmerButton background="#3977e8">جرب مجاناً</ShimmerButton>
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
