"use client";
import Navbar from "@/components/landing-page/Navbar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { MacbookScroll } from "@/components/landing-page/macbook-scroll";
import { TypewriterEffect } from "@/components/landing-page/typewriter-effect";
import {TextAnimate} from "@/components/landing-page/text-animate";
import { motion } from "framer-motion";

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
                <section className="relative flex justify-center items-center pt-24 pb-10 sm:pt-32 sm:pb-16 lg:pb-24">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-20">
                        <div className="max-w-xl mx-auto text-center">
                            <h1>
                                <TypewriterEffect words={heroWords} className="mt-5 text-4xl font-bold sm:text-6xl md:leading-20" cursorClassName="bg-[#ff5291]" />
                            </h1>
                            <TextAnimate className="mt-8 text-base text-gray-700 sm:text-xl" animation="blurIn" delay={1}>
                                بيلفورا هي منصتك الذكية لإصدار الفواتير الإلكترونية للمستقلين وأصحاب الأعمال
                            </TextAnimate>
                            {/* CTA Buttons  */}
                            <motion.div
                                initial={{ opacity: 0}}
                                animate={{ opacity: 1}}
                                transition={{ duration: 0.5, delay: 1.5 }}
                                className="flex items-center justify-center gap-10 mt-8">
                                <Link href="/" className="items-center gap-0.5 group lg:flex">
                                    <button className="text-[#7f2dfb] font-bold cursor-pointer group-hover:text-[#012d46] transition-all duration-100">الدخول</button>
                                    <ChevronLeft size={20} strokeWidth={1.75} className="text-[#7f2dfb] transition-all duration-200 group-hover:-translate-x-1 group-hover:text-[#012d46]" />
                                </Link>
                                <Link href="/">
                                    <MainButton text="جرب مجاناً" bgColor="bg-[#7f2dfb]" textColor="text-white" className=" md:flex" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>
                {/* secttion two */}
                <MacbookScroll
                    src="https://img.freepik.com/free-vector/business-dashboard-user-panel_52683-26695.jpg?t=st=1745520726~exp=1745524326~hmac=87d616cd0a7d1e0c964a5ce26ce6c98790d80147b27997f5dc1732e56258e51a&w=1380"
                    showGradient={true}
                    title="لوحة تحكم بسيطة وممكنة"
                />
            </div>
        </>
    );
}
