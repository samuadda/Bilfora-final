"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/landing-page/MenuButton";
import MainButton from "@/components/MainButton";

interface NavigationMenuProps {
    NavItems: { name: string; href: string }[];
    MainButtonText: string;
}

export function NavigationMenu({ NavItems, MainButtonText }: NavigationMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (menuRef.current && !menuRef.current.contains(target) && !target.closest(".menu-button")) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (!isMounted) return;
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen, isMounted]);

    const toggleMenu = () => setIsOpen(prev => !prev);

    if (!isMounted) return null;

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="fixed top-4 left-4 z-[100] md:hidden bg-[#7f2dfb] rounded-md shadow-md">
                <Button variant="ghost" size="icon" className="menu-button" onClick={toggleMenu} aria-expanded={isOpen} aria-controls="mobile-menu">
                    {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
                    <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={cn("fixed inset-0 bg-black/50 z-40 transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} aria-hidden="true" />

            {/* Mobile Menu */}
            <div
                ref={menuRef}
                id="mobile-menu"
                className={cn(
                    "fixed inset-0 sm:inset-y-0 sm:right-0 w-full sm:w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Main navigation"
            >
                <div className="flex flex-col h-full p-6 overflow-y-auto">
                    <div className="flex-1 pt-12">
                        <nav className="flex flex-col space-y-10">
                            {NavItems.map(item => (
                                <Link key={item.name} href={item.href} className="text-xl font-medium text-gray-800 hover:text-gray-900 transition-colors " onClick={() => setIsOpen(false)}>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="pt-6 border-t border-gray-200">
                        <MainButton text={MainButtonText} className="w-full bg-[#7f2dfb] text-white" onClick={() => setIsOpen(false)} />
                    </div>
                </div>
            </div>
        </>
    );
}
