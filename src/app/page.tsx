"use client";
import Navbar from "@/components/landing-page/Navbar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { TypewriterEffect } from "@/components/landing-page/typewriter-effect";
import {TextAnimate} from "@/components/landing-page/text-animate";
import { motion } from "framer-motion";
import { Safari } from "@/components/landing-page/safari";
import {Features} from "@/components/landing-page/features";
import Iphone15Pro from "@/components/landing-page/iphone-15-pro";


export default function Home() {
        const heroWords = [
            { text: "أنشئ", className: "text-[#012d46]" },
            { text: " فواتيرك", className: "text-[#012d46]" },
            { text: "في", className: "text-[#012d46]" },
            { text: "ثوانٍ", className: "text-[#012d46]" },
            { text: "بسهولة", className: "text-[#012d46]" },
            { text: "واحترافية", className: "text-[#012d46]" },
        ];

    return (
        <>
            <div className="bg-gradient-to-b from-[#ffffff] relative to-[#7f2dfb]">
                <Navbar />
                {/* hero section */}
                <section className="relative flex justify-center items-center h-[90vh] pt-24 pb-10 sm:pt-32 sm:pb-16 lg:pb-24">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-20">
                        <div className="max-w-xl mx-auto text-center">
                            <h1>
                                <TypewriterEffect words={heroWords} className="mt-5 text-4xl font-bold sm:text-6xl md:leading-20" cursorClassName="bg-[#ff5291]" />
                            </h1>
                            <TextAnimate className="mt-8 text-base text-gray-700 sm:text-xl" animation="blurIn" delay={1}>
                                بيلفورا هي منصتك الذكية لإصدار الفواتير الإلكترونية للمستقلين وأصحاب الأعمال
                            </TextAnimate>
                            {/* CTA Buttons  */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.5 }} className="flex items-center justify-center gap-10 mt-8">
                                <Link href="/" className="items-center gap-0.5 group lg:flex hidden md:inline-block">
                                    <button className=" text-[#7f2dfb] font-bold cursor-pointer group-hover:text-[#012d46] transition-all duration-100">الدخول</button>
                                    <ChevronLeft size={20} strokeWidth={1.75} className="text-[#7f2dfb] transition-all duration-200 group-hover:-translate-x-1 group-hover:text-[#012d46]" />
                                </Link>
                                <Link href="/">
                                    <MainButton text="جرب مجاناً" bgColor="bg-[#7f2dfb]" textColor="text-white" className=" md:flex" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>
                {/* features */}
                <div className="h-screen">
                    <Features />
                </div>
                {/* secttion two */}
                <div className="flex flex-col items-center justify-center gap-10 mt-8 mb-10">
                    {/* <h1 className="text-3xl md:text-4xl font-bold text-center text-[#012d46]">بلفرها من جوالك في ثوانٍ</h1> */}
                    <Iphone15Pro />
                    <Safari className="size-1/2" url=" Bilfora.com " imageSrc="https://via.placeholder.com/1200x750" />
                </div>
            </div>
        </>
    );
}
