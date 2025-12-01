"use client";
import Navbar from "@/components/landing-page/Navbar";
import { ChevronLeft, ChevronUp, Star } from "lucide-react";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { TypewriterEffect } from "@/components/landing-page/typewriter-effect";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { motion, AnimatePresence } from "framer-motion";
import { Safari } from "@/components/landing-page/safari";
import { Features } from "@/components/landing-page/Features";
import Iphone15Pro from "@/components/landing-page/iphone-15-pro";
import { ElegantFeatures } from "@/components/landing-page/elegant-features";
import { Marquee } from "@/components/landing-page/marquee";
import { cn } from "@/lib/utils";
import { Ripple } from "@/components/landing-page/ripple";
import Image from "next/image";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { Pricing } from "@/components/landing-page/Pricing";
import { FAQ } from "@/components/landing-page/FAQ";
import { Logos } from "@/components/landing-page/Logos";
import { useState, useEffect, useRef } from "react";

function StatNumber({
	value,
	prefix = "",
	suffix = "",
	duration = 1200,
}: {
	value: number;
	prefix?: string;
	suffix?: string;
	duration?: number;
}) {
	const ref = useRef<HTMLSpanElement | null>(null);
	const [display, setDisplay] = useState(0);
	const [hasAnimated, setHasAnimated] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && !hasAnimated) {
					setHasAnimated(true);
					const start = performance.now();
					const startValue = 0;

					const animate = (time: number) => {
						const progress = Math.min((time - start) / duration, 1);
						const current = startValue + (value - startValue) * progress;
						setDisplay(current);
						if (progress < 1) {
							requestAnimationFrame(animate);
						}
					};

					requestAnimationFrame(animate);
				}
			},
			{ threshold: 0.5 }
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [value, duration, hasAnimated]);

	const formatted = Math.round(display).toLocaleString("en-US");

	return (
		<span ref={ref}>
			{prefix}
			{formatted}
			{suffix}
		</span>
	);
}

export default function Home() {
	const [showScrollButton, setShowScrollButton] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			// Show button after scrolling down 400px
			if (window.scrollY > 400) {
				setShowScrollButton(true);
			} else {
				setShowScrollButton(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	const heroWords = [
		{ text: "أنشئ", className: "text-[#012d46]" },
		{ text: " فواتيرك", className: "text-[#012d46]" },
		{ text: "في", className: "text-[#012d46]" },
		{ text: "ثوانٍ", className: "text-[#012d46]" },
		{ text: "بسهولة", className: "text-[#012d46]" },
		{ text: "واحترافية", className: "text-[#7f2dfb]" },
	];

	const content = [
		{
			title: "أنشئ فاتورة خلال ثوانٍ",
			description:
				"ابدأ بإدخال بيانات العميل والخدمة وحدد الأسعار والضرائب، وسيولد بيلفورا فاتورة احترافية جاهزة للطباعة أو الإرسال بنقرة واحدة.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white text-2xl font-bold p-8 text-center rounded-xl">
					أنشئ فاتورة خلال ثوانٍ
				</div>
			),
		},
		{
			title: "إدارة العملاء والخدمات بسهولة",
			description:
				"احفظ قائمة عملائك وخدماتك مع الأسعار والضرائب المفضلة، واخترها بسرعة في كل فاتورة بدون إعادة إدخال البيانات.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white text-2xl font-bold p-8 text-center rounded-xl">
                    قاعدة بيانات ذكية
				</div>
			),
		},
		{
			title: "تتبّع المدفوعات وإشعارات الاستحقاق",
			description:
				"اعرف الفواتير المدفوعة والمتأخرة بنظرة واحدة، وأرسل تذكيرات بسيطة لعملائك برابط دفع أو نسخة PDF.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--blue-500),var(--indigo-500))] text-white text-2xl font-bold p-8 text-center rounded-xl">
					تتبّع المدفوعات
				</div>
			),
		},
		{
			title: "قوالب عربية ومشاركة برابط",
			description:
				"اختر من قوالب عربية جميلة وشارك فاتورتك برابط مباشر أو حمّلها PDF مع شعارك وبيانات منشأتك.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--pink-500),var(--rose-500))] text-white text-2xl font-bold p-8 text-center rounded-xl">
					قوالب عربية جاهزة
				</div>
			),
		},
	];

	const reviews = [
		{
			name: "رؤى",
			username: "@ٌruwwa",
			body: "تصاميمهم حلوة واحترافية، وسهلة الاستخدام. أنصحكم تجربونها.",
			img: "https://avatar.vercel.sh/jack",
		},
		{
			name: "عبدالعزيز الصلي",
			username: "@azzozSelli",
			body: "سهولة وسرعة مسجل الخدمات بأسعارها اختار وامشي",
			img: "https://avatar.vercel.sh/jill",
		},
		{
			name: "الإبداع البصري",
			username: "@visualcreate",
			body: "ابدااااع وتراني صعبة الإرضاء (;",
			img: "https://avatar.vercel.sh/john",
		},
		{
			name: "عمران",
			username: "@umran",
			body: "كل ذا ومجاني والله مب مصدق",
			img: "https://avatar.vercel.sh/jane",
		},
		{
			name: "العليمي",
			username: "@ulaimi",
			body: "بسيط وسريع ومن الجوال",
			img: "https://avatar.vercel.sh/jenny",
		},
		{
			name: "ذرب",
			username: "@tharb",
			body: "والله انه فزعة توهت وفي ثواني ضبطني",
			img: "https://avatar.vercel.sh/james",
		},
	];

	const firstRow = reviews.slice(0, reviews.length / 2);
	const secondRow = reviews.slice(reviews.length / 2);

	const ReviewCard = ({
		img,
		name,
		username,
		body,
	}: {
		img: string;
		name: string;
		username: string;
		body: string;
	}) => {
		return (
			<figure
				className={cn(
					"relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
					// light styles
					"border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
					// dark styles
					"dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
				)}
			>
				<div className="flex flex-row items-center gap-2">
					<Image
						className="rounded-full"
						width={32}
						height={32}
						alt=""
						src={img}
					/>
					<div className="flex flex-col">
						<figcaption className="text-sm font-medium dark:text-white">
							{name}
						</figcaption>
						<p className="text-xs font-medium dark:text-white/40">
							{username}
						</p>
					</div>
				</div>
				<blockquote className="mt-2 text-sm">{body}</blockquote>
			</figure>
		);
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<>
			<div className="relative bg-white overflow-hidden" id="home">
				<Navbar />

				{/* Scroll to top button */}
				<AnimatePresence>
					{showScrollButton && (
						<motion.button
							onClick={scrollToTop}
							className="fixed bottom-8 right-8 z-50 p-3 bg-[#7f2dfb] text-white rounded-full shadow-lg hover:bg-[#6a1fd8] hover:shadow-xl transition-all duration-200 hover:scale-110"
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0 }}
							transition={{ duration: 0.3 }}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
						>
							<ChevronUp size={24} />
						</motion.button>
					)}
				</AnimatePresence>

				{/* hero section */}
				<section className="relative flex justify-center items-center pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
					<div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#7f2dfb] opacity-20 blur-[100px]"></div>
                    </div>
					
					<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-20">
						<div className="max-w-4xl mx-auto text-center">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-8"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-purple-600 ml-2 animate-pulse"></span>
                                جديد: نظام إدارة الفواتير الأذكى في المملكة 🇸🇦
                            </motion.div>
							<h1>
								<TypewriterEffect
									words={heroWords}
									className="text-5xl leading-tight font-bold sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight lg:text-8xl lg:leading-tight tracking-tight"
									cursorClassName="bg-[#ff5291]"
								/>
							</h1>
							<TextAnimate
								className="mt-8 text-lg text-gray-600 sm:text-2xl max-w-2xl mx-auto leading-relaxed"
								animation="blurIn"
								once={true}
								delay={1}
							>
								بيلفورا هي منصتك الذكية لإصدار الفواتير
								الإلكترونية للمستقلين وأصحاب الأعمال. وفّر وقتك ومجهودك وركز على شغفك.
							</TextAnimate>
							
							{/* CTA Buttons  */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 1.5 }}
								className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10"
							>
								<Link href="/register">
									<MainButton
										text="جرب مجاناً الآن"
										bgColor="bg-[#7f2dfb]"
										textColor="text-white"
										className="w-full sm:w-auto px-8 py-4 text-lg shadow-purple-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
									/>
								</Link>
								<Link
									href="/login"
									className="group flex items-center gap-2 text-gray-600 font-medium hover:text-[#7f2dfb] transition-colors"
								>
									<span>تسجيل الدخول</span>
									<ChevronLeft
										size={20}
										className="transition-transform group-hover:-translate-x-1"
									/>
								</Link>
							</motion.div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2, duration: 1 }}
                                className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500"
                            >
                                <div className="flex -space-x-2 space-x-reverse">
                                    {[1,2,3,4].map((i) => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                             <Image src={`https://avatar.vercel.sh/${i}`} width={32} height={32} alt="user" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="flex text-yellow-400">
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                    <span className="font-bold text-gray-700">5.0</span>
                                </div>
                                <span>من 500+ عميل سعيد</span>
                            </motion.div>
						</div>
					</div>
				</section>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Logos />
				</motion.div>

				{/* features */}
				<motion.div
					id="features"
					className="relative z-10"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Features />
				</motion.div>

				{/* mock up */}
				<section className="py-24 bg-gray-50 overflow-hidden">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex flex-col items-center justify-center gap-10 mb-16 text-center">
							<TextAnimate
								as="h2"
								animation="blurIn"
								once={true}
								className="text-4xl font-bold md:text-5xl text-[#012d46]"
							>
								بلفرها من جوالك أو لابتوبك في ثوانٍ
							</TextAnimate>
							<p className="max-w-2xl text-lg text-gray-600">
								تجربة استخدام سلسة ومتناسقة عبر جميع أجهزتك. ابدأ الفاتورة من المكتب وأرسلها من المقهى.
							</p>
						</div>
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.2 }}
							className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16"
						>
							<Iphone15Pro
								className="w-full max-w-[300px] h-auto shadow-2xl rounded-[3rem]"
								src="/phoneDashboardDemo.png"
							/>
							<div className="w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden border border-gray-200">
								<Safari
									className="w-full h-auto"
									url="bilfora.com/dashboard"
									imageSrc="/dashboardDemo.png"
								/>
							</div>
						</motion.div>

						{/* statistics section */}
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
							className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
						>
							<div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-6 text-center">
								<p className="text-3xl md:text-4xl font-extrabold text-[#7f2dfb] mb-1">
									<StatNumber value={10} prefix="+" suffix="K" />
								</p>
								<p className="text-sm font-semibold text-slate-800">
									فاتورة مُصدَرة
								</p>
								<p className="mt-1 text-xs text-slate-500">
									تم إنشاؤها من خلال بيلفورا
								</p>
							</div>
							<div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-6 text-center">
								<p className="text-3xl md:text-4xl font-extrabold text-emerald-500 mb-1">
									<StatNumber value={500} prefix="+" />
								</p>
								<p className="text-sm font-semibold text-slate-800">
									منشأة ومستقل
								</p>
								<p className="mt-1 text-xs text-slate-500">
									يعتمدون على بيلفورا يومياً
								</p>
							</div>
							<div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-6 text-center">
								<p className="text-3xl md:text-4xl font-extrabold text-cyan-500 mb-1">
									<StatNumber value={3} prefix="+" suffix="M" />
								</p>
								<p className="text-sm font-semibold text-slate-800">
									SAR قيمة فواتير
								</p>
								<p className="mt-1 text-xs text-slate-500">
									تمت معالجتها عبر المنصة
								</p>
							</div>
							<div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-6 text-center">
								<p className="text-3xl md:text-4xl font-extrabold text-amber-500 mb-1">
									<StatNumber value={90} suffix="%" />
								</p>
								<p className="text-sm font-semibold text-slate-800">
									توفّر في الوقت
								</p>
								<p className="mt-1 text-xs text-slate-500">
									عند إنشاء وإرسال الفواتير
								</p>
							</div>
						</motion.div>
					</div>
				</section>

				{/* how does it work ? */}
				<div className="py-24 bg-gradient-to-b from-white to-gray-50" id="how-to">
                    <div className="text-center mb-16">
                        <TextAnimate
                            as="h2"
                            animation="blurIn"
                            once={true}
                            className="text-4xl font-bold md:text-5xl text-[#012d46]"
                        >
                            كيف تبلفرها ؟
                        </TextAnimate>
                        <p className="mt-4 text-lg text-gray-600">
                            خطوات بسيطة تفصلك عن فاتورتك الأولى
                        </p>
                    </div>
					<ElegantFeatures content={content} />
				</div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Pricing />
				</motion.div>

				{/* Reviews */}
				<motion.div
					className="relative flex w-full flex-col items-center justify-center py-24 bg-slate-50 overflow-hidden"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					<div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold md:text-5xl text-[#012d46] mb-4">
                            تجارب أصدقائنا
                        </h2>
                        <p className="text-lg text-gray-600">
                            قصص نجاح من أشخاص مثلك يستخدمون بيلفورا يومياً
                        </p>
                    </div>
					<Marquee pauseOnHover className="[--duration:40s]">
						{firstRow.map((review) => (
							<ReviewCard key={review.username} {...review} />
						))}
					</Marquee>
					<Marquee reverse pauseOnHover className="[--duration:40s] mt-8">
						{secondRow.map((review) => (
							<ReviewCard key={review.username} {...review} />
						))}
					</Marquee>
					<div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-50"></div>
					<div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-50"></div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<FAQ />
				</motion.div>

				{/* CTA Section */}
				<footer className="max-w-screen mx-auto relative overflow-hidden pt-20">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.4 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						className="max-w-6xl mx-auto px-4 relative flex flex-col justify-center mb-24 items-center gap-8 text-center py-16 lg:py-24 rounded-3xl bg-gradient-to-br from-[#7f2dfb] to-indigo-600 overflow-hidden shadow-2xl mx-4 lg:mx-auto"
					>
						<Ripple
							mainCircleSize={500}
							mainCircleOpacity={0.3}
							numCircles={12}
							className="absolute inset-0 z-0 text-white"
						/>
						<h1 className="relative z-10 text-3xl md:text-5xl text-white font-bold max-w-4xl leading-tight">
							لا تضيع وقتك مع إكسل أو الفواتير اليدوية
                            <br/>
                            <span className="text-purple-200">جرب بيلفورا مجاناً اليوم</span>
						</h1>
                        <p className="relative z-10 text-lg text-purple-100 max-w-2xl">
                            انضم للآلاف من المستقلين الذين ينظمون أعمالهم بذكاء. بدون بطاقة ائتمان.
                        </p>
						<Link href="/register" className="relative z-10">
							<button className="px-10 py-4 rounded-full text-[#7f2dfb] font-bold text-lg bg-white cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
								ابدأ الآن مجاناً
							</button>
						</Link>
					</motion.div>

					{/* Main Footer */}
					<div className="bg-[#0f172a] text-white border-t border-gray-800">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
								{/* Company Info */}
								<div className="space-y-6">
									<Link href="/" className="inline-block">
										<Image
											src="/logoPNG.png"
											alt="Bilfora"
											width={140}
											height={40}
											className="h-10 w-auto brightness-0 invert"
										/>
									</Link>
									<p className="text-gray-400 text-sm leading-relaxed">
										منصة ذكية لإصدار الفواتير الإلكترونية
										للمستقلين وأصحاب الأعمال. أنشئ فواتيرك
										بسهولة واحترافية في ثوانٍ.
									</p>
									<div className="flex items-center space-x-4 space-x-reverse">
										<Link
											href="https://twitter.com/bilfora"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-400 hover:text-[#7f2dfb] transition-colors p-1"
										>
											<svg
												className="h-5 w-5"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
											</svg>
										</Link>
										<Link
											href="https://instagram.com/bilfora"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-400 hover:text-[#7f2dfb] transition-colors p-1"
										>
											<svg
												className="h-5 w-5"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z" />
											</svg>
										</Link>
										<Link
											href="https://linkedin.com/company/bilfora"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-400 hover:text-[#7f2dfb] transition-colors p-1"
										>
											<svg
												className="h-5 w-5"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
											</svg>
										</Link>
									</div>
								</div>

								{/* Product Links */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-white">
										المنتج
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/dashboard"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												لوحة التحكم
											</Link>
										</li>
										<li>
											<Link
												href="/dashboard/invoices"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												إنشاء الفواتير
											</Link>
										</li>
										<li>
											<Link
												href="/#pricing"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												الأسعار
											</Link>
										</li>
									</ul>
								</div>

								{/* Support Links */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-white">
										الدعم والمساعدة
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/help"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												مركز المساعدة
											</Link>
										</li>
										<li>
											<Link
												href="/contact"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												تواصل معنا
											</Link>
										</li>
										<li>
											<Link
												href="/#faq"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												الأسئلة الشائعة
											</Link>
										</li>
									</ul>
								</div>

								{/* Legal & Company */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-white">
										الشركة
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/about"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												من نحن
											</Link>
										</li>
										<li>
											<Link
												href="/privacy"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												سياسة الخصوصية
											</Link>
										</li>
										<li>
											<Link
												href="/terms"
												className="text-gray-400 hover:text-[#7f2dfb] transition-colors text-sm"
											>
												شروط الاستخدام
											</Link>
										</li>
									</ul>
								</div>
							</div>

							{/* Newsletter Signup */}
							<div className="mt-16 pt-8 border-t border-gray-800/50">
								<div className="max-w-md mx-auto text-center">
									<h3 className="text-lg font-semibold mb-2 text-white">
										ابق على اطلاع
									</h3>
									<p className="text-gray-400 text-sm mb-6">
										اشترك في نشرتنا الإخبارية للحصول على آخر
										التحديثات والنصائح
									</p>
									<div className="flex gap-2">
										<input
											type="email"
											placeholder="بريدك الإلكتروني"
											className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb] focus:border-transparent transition-all"
										/>
										<button className="px-6 py-2.5 bg-[#7f2dfb] text-white rounded-lg hover:bg-[#6a1fd8] transition-colors font-medium">
											اشترك
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Bar */}
						<div className="bg-[#0b1120] border-t border-gray-800/50">
							<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
								<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
									<div className="text-gray-500 text-sm">
										© 2025 بيلفورا. جميع الحقوق محفوظة.
									</div>
									<div className="flex items-center space-x-6 space-x-reverse text-sm">
										<Link
											href="/privacy"
											className="text-gray-500 hover:text-white transition-colors"
										>
											الخصوصية
										</Link>
										<Link
											href="/terms"
											className="text-gray-500 hover:text-white transition-colors"
										>
											الشروط
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
}
