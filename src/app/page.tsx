"use client";
import Navbar from "@/components/landing-page/Navbar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { TypewriterEffect } from "@/components/landing-page/typewriter-effect";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { motion } from "framer-motion";
import { Safari } from "@/components/landing-page/safari";
import { Features } from "@/components/landing-page/features";
import Iphone15Pro from "@/components/landing-page/iphone-15-pro";
import {StickyScroll} from "@/components/landing-page/sticky-scroll-reveal";

export default function Home() {
    const heroWords = [
        { text: "أنشئ", className: "text-[#012d46]" },
        { text: " فواتيرك", className: "text-[#012d46]" },
        { text: "في", className: "text-[#012d46]" },
        { text: "ثوانٍ", className: "text-[#012d46]" },
        { text: "بسهولة", className: "text-[#012d46]" },
        { text: "واحترافية", className: "text-[#012d46]" },
    ];

    const content = [
        {
            title: "1 - سجل حسابك ",
            description:
                "سجل بجوالك أو الايميل أو حتى بجوجل",
            content: <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">Collaborative Editing</div>,
        },
        {
            title: "2 - عبّي بيانات العميل والخدمة",
            description:
                "بيانات عملائك وخدماتك سجلها مرة تلاقيها كل مرة",
            content: <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white">Version control</div>,
        },
        {
            title: "3 - أرسلها برابط أو PDF خلال ثواني",
            description:
                "رابط وملف صورة أو حى مطبوعة العميل ماله عذر",
            content: <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">Running out of content</div>,
        },
    ];

    return (
        <>
            <div className="bg-gradient-to-b from-[#ffffff] relative to-[#7f2dfb]">
                <Navbar />
                {/* hero section */}
                <section className="relative flex justify-center items-center h-[90vh] pt-24 pb-10 sm:pt-32 sm:pb-16 lg:pb-24">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-20">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1>
                                <TypewriterEffect
                                    words={heroWords}
                                    className="mt-5 text-4xl leading-14 font-bold sm:text-5xl sm:leading-18 md:text-7xl md:leading-24 lg:text-7xl lg:leading-24"
                                    cursorClassName="bg-[#ff5291]"
                                />
                            </h1>
                            <TextAnimate className="mt-8 text-base text-gray-700 sm:text-2xl" animation="blurIn" delay={1}>
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
                <div className="mb-60">
                    <Features />
                </div>
                {/* mock up */}
                <div className="flex flex-col items-center justify-center gap-10 mb-60">
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-[#012d46]">بلفرها من جوالك أو لابتوبك في ثوانٍ</h1>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                        <Iphone15Pro className="size-1/6" src="https://via.placeholder.com/1200x750" />
                        <Safari className="size-1/2" url=" Bilfora.com " imageSrc="https://via.placeholder.com/1200x750" />
                    </div>
                </div>
                {/* how does it work ? */}
                <div className="mb-60">
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-[#012d46]">كيف تبلفرها ؟</h1>
                    <StickyScroll content={content} contentClassName="w-1/3" />
                </div>
            </div>
        </>
    );
}
