"use client";
import Navbar from "@/components/landing-page/Navbar";
import { ChevronLeft, ChevronUp } from "lucide-react";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { TypewriterEffect } from "@/components/landing-page/typewriter-effect";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { motion } from "framer-motion";
import { Safari } from "@/components/landing-page/safari";
import { Features } from "@/components/landing-page/features";
import Iphone15Pro from "@/components/landing-page/iphone-15-pro";
import { StickyScroll } from "@/components/landing-page/sticky-scroll-reveal";
import { Marquee } from "@/components/landing-page/marquee";
import { cn } from "@/lib/utils";
import { Ripple } from "@/components/landing-page/ripple";
import Image from "next/image";
import { DotPattern } from "@/components/landing-page/dot-pattern";

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
			title: "إنشاء الفاتورة",
			description:
				"أنشئ فاتورة احترافية في دقائق! اختر من قوالبنا الجاهزة أو صمم فاتورتك الخاصة. أضف المنتجات والخدمات، واحسب الضرائب تلقائياً، واختر العملة المناسبة.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#012d46] to-[#7f2dfb] text-white text-2xl font-bold">
					إنشاء الفاتورة
				</div>
			),
		},
		{
			title: "إرسال وتتبع",
			description:
				"أرسل فواتيرك للعملاء عبر البريد الإلكتروني مباشرة من النظام. تتبع حالة الفواتير بسهولة - مدفوعة، معلقة، أو متأخرة. احصل على إشعارات فورية عند الدفع.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7f2dfb] to-[#ff6b9d] text-white text-2xl font-bold">
					إرسال وتتبع
				</div>
			),
		},
		{
			title: "المدفوعات الإلكترونية",
			description:
				"اقبل المدفوعات بسهولة! النظام يدعم جميع بوابات الدفع الشائعة مثل PayPal وStripe وMada. احصل على أموالك فوراً مع تقارير مفصلة عن جميع المعاملات.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff6b9d] to-[#012d46] text-white text-2xl font-bold">
					المدفوعات الإلكترونية
				</div>
			),
		},
		{
			title: "التقارير والإحصائيات",
			description:
				"احصل على رؤية شاملة لعملك! عرض المبيعات الشهرية، العملاء الأكثر نشاطاً، المنتجات الأكثر مبيعاً، وتحليل الأرباح. اتخذ قرارات مدروسة بناءً على البيانات الفعلية.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#012d46] to-[#7f2dfb] text-white text-2xl font-bold">
					التقارير والإحصائيات
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
					<img
						className="rounded-full"
						width="32"
						height="32"
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
			<div className="relative" id="home">
				<Navbar />

				{/* Scroll to top button */}
				<motion.button
					onClick={scrollToTop}
					className="fixed bottom-8 right-8 z-50 p-3 bg-[#7f2dfb] text-white rounded-full shadow-lg hover:bg-[#6a1fd8] hover:shadow-xl transition-all duration-200 hover:scale-110"
					initial={{ opacity: 0, scale: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3, delay: 2 }}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
				>
					<ChevronUp size={24} />
				</motion.button>

				{/* hero section */}
				<section className="relative flex justify-center items-center h-[90vh] pt-24 pb-10 sm:pt-32 sm:pb-16 lg:pb-24">
					<DotPattern
						width={20}
						height={20}
						glow={true}
						className={cn(
							"[mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)] "
						)}
					/>
					<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-20">
						<div className="max-w-4xl mx-auto text-center">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6 }}
								className="mb-6"
							>
								<div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
									<span className="text-white/90 text-sm font-medium">
										✨ منصة الفواتير الأولى في السعودية
									</span>
								</div>
							</motion.div>
							<h1>
								<TypewriterEffect
									words={heroWords}
									className="mt-5 text-4xl leading-14 font-bold sm:text-5xl sm:leading-18 md:text-7xl md:leading-24 lg:text-7xl lg:leading-24"
									cursorClassName="bg-[#ff5291]"
								/>
							</h1>
							<TextAnimate
								className="mt-8 text-lg text-gray-700 sm:text-2xl max-w-3xl mx-auto leading-relaxed"
								animation="blurIn"
								once={true}
								delay={1}
							>
								بيلفورا هي منصتك الذكية لإصدار الفواتير
								الإلكترونية للمستقلين وأصحاب الأعمال. أنشئ،
								أرسل، وتتبع فواتيرك بسهولة واحترافية
							</TextAnimate>
							{/* CTA Buttons  */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.5, delay: 1.5 }}
								className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10"
							>
								<Link href="/register">
									<MainButton
										text="ابدأ مجاناً الآن"
										bgColor="bg-gradient-to-r from-[#7f2dfb] to-[#ff6b9d]"
										textColor="text-white"
										className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
									/>
								</Link>
								<Link
									href="/login"
									className="items-center gap-0.5 group lg:flex hidden md:inline-block"
								>
									<button className="text-[#7f2dfb] font-bold cursor-pointer group-hover:text-[#012d46] transition-all duration-100 text-lg px-6 py-3 border-2 border-[#7f2dfb] rounded-lg hover:bg-[#7f2dfb] hover:text-white">
										الدخول
										<ChevronLeft
											size={20}
											strokeWidth={1.75}
											className="text-[#7f2dfb] group-hover:text-white transition-all duration-200 group-hover:-translate-x-1"
										/>
									</button>
								</Link>
							</motion.div>
							{/* Trust indicators */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 2 }}
								className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
							>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									<span>آمن 100%</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<span>دعم فني 24/7</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
									<span>مجاني للأبد</span>
								</div>
							</motion.div>
						</div>
					</div>
				</section>
				{/* features */}
				<div className="mb-60" id="features">
					<Features />
				</div>
				{/* mock up */}
				<div className="flex flex-col items-center justify-center gap-16 mb-60">
					<div className="text-center max-w-4xl mx-auto px-4">
						<TextAnimate
							as="h2"
							animation="blurIn"
							once={true}
							className="text-4xl font-bold md:text-5xl mb-6"
						>
							بلفرها من جوالك أو لابتوبك في ثوانٍ
						</TextAnimate>
						<TextAnimate
							as="p"
							animation="blurIn"
							once={true}
							delay={0.3}
							className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
						>
							سواء كنت تستخدم هاتفك الذكي أو حاسوبك المحمول،
							بيلفورا يعمل بسلاسة على جميع الأجهزة. أنشئ فواتيرك
							في أي مكان وفي أي وقت!
						</TextAnimate>
					</div>
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
						viewport={{ once: true, amount: 0.3 }}
						className="flex flex-col md:flex-row items-center justify-center gap-16"
					>
						<div className="text-center md:text-right">
							<Iphone15Pro
								className="size-80"
								src="https://via.placeholder.com/400x800"
							/>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								viewport={{ once: true }}
								className="mt-6"
							>
								<h3 className="text-xl font-semibold text-[#012d46] mb-2">
									تطبيق الهاتف
								</h3>
								<p className="text-gray-600 max-w-xs">
									أنشئ الفواتير وأنت في الطريق، في الاجتماع،
									أو في أي مكان
								</p>
							</motion.div>
						</div>
						<div className="text-center md:text-left">
							<Safari
								className="size-96"
								url="Bilfora.com"
								imageSrc="https://via.placeholder.com/800x600"
							/>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.5 }}
								viewport={{ once: true }}
								className="mt-6"
							>
								<h3 className="text-xl font-semibold text-[#012d46] mb-2">
									الويب المتقدم
								</h3>
								<p className="text-gray-600 max-w-xs">
									استخدم جميع الميزات المتقدمة من متصفحك
									المفضل
								</p>
							</motion.div>
						</div>
					</motion.div>
				</div>
				{/* how does it work ? */}
				<div className="mb-60 " id="how-to">
					<TextAnimate
						as="h2"
						animation="blurIn"
						once={true}
						className="text-4xl font-bold md:text-4xl text-center mx-auto"
					>
						كيف تبلفرها ؟
					</TextAnimate>
					<StickyScroll content={content} contentClassName="w-1/3" />
				</div>
				{/* Reviews */}
				<div className="relative flex w-full flex-col items-center justify-center mb-50 overflow-hidden">
					<TextAnimate
						as="h2"
						animation="blurIn"
						once={true}
						className="text-4xl text-center font-bold md:text-4xl py-5"
					>
						تجارب أصدقائنا
					</TextAnimate>
					<Marquee pauseOnHover className="[--duration:20s]">
						{firstRow.map((review) => (
							<ReviewCard key={review.username} {...review} />
						))}
					</Marquee>
					<Marquee reverse pauseOnHover className="[--duration:20s]">
						{secondRow.map((review) => (
							<ReviewCard key={review.username} {...review} />
						))}
					</Marquee>
					<div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
					<div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
				</div>
				<footer className=" max-w-screen mx-auto relative overflow-hidden pt-20">
					<div className="max-w-[80%] mx-auto relative flex flex-col justify-center items-center gap-10 min-w-2/3 text-sm mx-5 py-6 md:py-10 md:px-5 lg:py-20 lg:px-10 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-400 overflow-hidden">
						<Ripple
							mainCircleSize={450}
							mainCircleOpacity={0.4}
							numCircles={10}
							className="absolute inset-0 z-0"
						/>
						<h1 className="relative z-10 text-2xl md:text-3xl text-white text-center font-bold max-w-2/3">
							لا تضيع وقتك مع إكسل أو غيره جرب بِلفورة مجانًا
							وسوِّ فاتورتك الآن
						</h1>
						<Link href="/register">
							<button className="relative z-10 px-10 py-3 rounded-4xl text-[#012d46] font-semibold bg-white cursor-pointer hover:bg-gray-50 active:translate-y-1 shadow-lg hover:shadow-xl transition-all duration-200">
								جرّب الآن مجاناً
							</button>
						</Link>
					</div>
					<div className="flex flex-col md:flex-row border-t mt-20 py-10 px-10 items-center justify-between max-w-[90%] mx-auto gap-8">
						<ul className="flex flex-col md:flex-row gap-7 text-gray-600">
							<li>
								<Link
									href="/privacy"
									className="hover:text-[#7f2dfb] transition-colors duration-200"
								>
									الخصوصية
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-[#7f2dfb] transition-colors duration-200"
								>
									الدعم
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="hover:text-[#7f2dfb] transition-colors duration-200"
								>
									الشروط
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-[#7f2dfb] transition-colors duration-200"
								>
									البريد
								</Link>
							</li>
						</ul>
						<Link
							href="/"
							className="hidden sm:inline-block shrink-1 mx-5 hover:opacity-80 transition-opacity duration-200"
						>
							<Image
								src="/logo-ar-purple.svg"
								alt="Bilfora Logo"
								width={120}
								height={120}
							/>
						</Link>
						<ul className="flex flex-col md:flex-row gap-7 text-gray-600">
							<li>
								<Link
									href="https://youtube.com"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-[#7f2dfb] transition-colors duration-200"
								>
									اليوتيوب
								</Link>
							</li>
							<li>
								<Link
									href="https://x.com"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-[#7f2dfb] transition-colors duration-200"
								>
									اكــس
								</Link>
							</li>
							<li>
								<Link
									href="https://instagram.com"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-[#7f2dfb] transition-colors duration-200"
								>
									انستقرام
								</Link>
							</li>
							<li>
								<Link
									href="https://linkedin.com"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-[#7f2dfb] transition-colors duration-200"
								>
									لينكد إن
								</Link>
							</li>
						</ul>
					</div>
					<div className="text-center py-6 border-t border-gray-200 max-w-[90%] mx-auto">
						<p className="text-gray-500 text-sm">
							© 2024 Bilfora. جميع الحقوق محفوظة | منصة الفواتير
							الإلكترونية الأولى في المملكة العربية السعودية
						</p>
					</div>
				</footer>
			</div>
		</>
	);
}
