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
			title: "أنشئ فاتورة خلال ثوانٍ",
			description:
				"ابدأ بإدخال بيانات العميل والخدمة وحدد الأسعار والضرائب، وسيولد بيلفورا فاتورة احترافية جاهزة للطباعة أو الإرسال بنقرة واحدة.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
					أنشئ فاتورة خلال ثوانٍ
				</div>
			),
		},
		{
			title: "إدارة العملاء والخدمات بسهولة",
			description:
				"احفظ قائمة عملائك وخدماتك مع الأسعار والضرائب المفضلة، واخترها بسرعة في كل فاتورة بدون إعادة إدخال البيانات.",
			content: (
				<div className="flex h-full w-full items-center justify-center text-white">
					<Image
						src=""
						width={300}
						height={300}
						className="h-full w-full object-cover"
						alt="Bilfora feature demo"
					/>
				</div>
			),
		},
		{
			title: "تتبّع المدفوعات وإشعارات الاستحقاق",
			description:
				"اعرف الفواتير المدفوعة والمتأخرة بنظرة واحدة، وأرسل تذكيرات بسيطة لعملائك برابط دفع أو نسخة PDF.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white">
					تتبّع المدفوعات
				</div>
			),
		},
		{
			title: "قوالب عربية ومشاركة برابط",
			description:
				"اختر من قوالب عربية جميلة وشارك فاتورتك برابط مباشر أو حمّلها PDF مع شعارك وبيانات منشأتك.",
			content: (
				<div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
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
			<div className="  relative " id="home">
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
						<div className="max-w-3xl mx-auto text-center">
							<h1>
								<TypewriterEffect
									words={heroWords}
									className="mt-5 text-4xl leading-14 font-bold sm:text-5xl sm:leading-18 md:text-7xl md:leading-24 lg:text-7xl lg:leading-24"
									cursorClassName="bg-[#ff5291]"
								/>
							</h1>
							<TextAnimate
								className="mt-8 text-base text-gray-700 sm:text-2xl"
								animation="blurIn"
								once={true}
								delay={1}
							>
								بيلفورا هي منصتك الذكية لإصدار الفواتير
								الإلكترونية للمستقلين وأصحاب الأعمال
							</TextAnimate>
							{/* CTA Buttons  */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.5, delay: 1.5 }}
								className="flex items-center justify-center gap-10 mt-8"
							>
								<Link
									href="/login"
									className="items-center gap-0.5 group lg:flex hidden md:inline-block"
								>
									<button className=" text-[#7f2dfb] font-bold cursor-pointer group-hover:text-[#012d46] transition-all duration-100">
										الدخول
									</button>
									<ChevronLeft
										size={20}
										strokeWidth={1.75}
										className="text-[#7f2dfb] transition-all duration-200 group-hover:-translate-x-1 group-hover:text-[#012d46]"
									/>
								</Link>
								<Link href="/register">
									<MainButton
										text="جرب مجاناً"
										bgColor="bg-[#7f2dfb]"
										textColor="text-white"
										className=" md:flex"
									/>
								</Link>
							</motion.div>
						</div>
					</div>
				</section>
				{/* features */}
				<div className="mb-60" id="features">
					<Features />
				</div>
				{/* mock up */}
				<div className="flex flex-col items-center justify-center gap-10 mb-60">
					<TextAnimate
						as="h2"
						animation="blurIn"
						once={true}
						className="text-4xl font-bold md:text-4xl"
					>
						بلفرها من جوالك أو لابتوبك في ثوانٍ
					</TextAnimate>
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						viewport={{ once: true, amount: 0.3 }}
						className="flex flex-col md:flex-row items-center justify-center gap-10"
					>
						<Iphone15Pro
							className="size-1/6"
							src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=600&fit=crop&crop=center"
						/>
						<Safari
							className="size-1/2"
							url="bilfora.com"
							imageSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center"
						/>
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
				<div className="relative flex w-full flex-col items-center justify-center mb-44 overflow-hidden">
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
				{/* CTA Section */}
				<footer className="max-w-screen mx-auto relative overflow-hidden pt-20">
					<div className="max-w-[80%] mx-auto relative flex flex-col justify-center mb-44 items-center gap-10 min-w-2/3 text-sm py-6 md:py-10 md:px-5 lg:py-20 lg:px-10 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-400 overflow-hidden">
						<Ripple
							mainCircleSize={450}
							mainCircleOpacity={0.4}
							numCircles={10}
							className="absolute inset-0 z-0"
						/>
						<h1 className="relative z-10 text-2xl md:text-3xl text-white text-center font-bold max-w-2/3 leading-tight">
							لا تضيع وقتك مع إكسل أو غيره جرب بِلفورة مجانًا
							وسوِّ فاتورتك الآن
						</h1>
						<Link href="/register">
							<button className="relative z-10 px-10 py-1.5 rounded-4xl text-[#012d46] font-semibold bg-white cursor-pointer active:translate-y-1 shadow-neutral-500">
								جرّب الآن
							</button>
						</Link>
					</div>

					{/* Main Footer */}
					<div className="bg-gray-900 text-white">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
								{/* Company Info */}
								<div className="space-y-4">
									<Link href="/" className="inline-block">
										<Image
											src="/logo-full-white.svg"
											alt="Bilfora"
											width={140}
											height={40}
											className="h-12 w-auto"
										/>
									</Link>
									<p className="text-gray-300 text-sm leading-relaxed">
										منصة ذكية لإصدار الفواتير الإلكترونية
										للمستقلين وأصحاب الأعمال. أنشئ فواتيرك
										بسهولة واحترافية في ثوانٍ.
									</p>
									<div className="flex items-center space-x-4">
										<Link
											href="https://twitter.com/bilfora"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-400 hover:text-white transition-colors p-1"
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
											className="text-gray-400 hover:text-white transition-colors p-1"
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
											href="https://youtube.com/@bilfora"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-400 hover:text-white transition-colors p-1"
										>
											<svg
												className="h-5 w-5"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
											</svg>
										</Link>
										<Link
											href="https://linkedin.com/company/bilfora"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-400 hover:text-white transition-colors p-1"
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
									<h3 className="text-lg font-semibold">
										المنتج
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/dashboard"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												لوحة التحكم
											</Link>
										</li>
										<li>
											<Link
												href="/dashboard/invoices"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												إنشاء الفواتير
											</Link>
										</li>
										<li>
											<Link
												href="/dashboard/clients"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												إدارة العملاء
											</Link>
										</li>
										<li>
											<Link
												href="/dashboard/analytics"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												التقارير والتحليلات
											</Link>
										</li>
										<li>
											<Link
												href="/pricing"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												الأسعار
											</Link>
										</li>
									</ul>
								</div>

								{/* Support Links */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">
										الدعم والمساعدة
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/help"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												مركز المساعدة
											</Link>
										</li>
										<li>
											<Link
												href="/contact"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												تواصل معنا
											</Link>
										</li>
										<li>
											<Link
												href="/faq"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												الأسئلة الشائعة
											</Link>
										</li>
										<li>
											<Link
												href="/tutorials"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												دروس تعليمية
											</Link>
										</li>
										<li>
											<Link
												href="/api"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												API للمطورين
											</Link>
										</li>
									</ul>
								</div>

								{/* Legal & Company */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">
										الشركة
									</h3>
									<ul className="space-y-3">
										<li>
											<Link
												href="/about"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												من نحن
											</Link>
										</li>
										<li>
											<Link
												href="/careers"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												الوظائف
											</Link>
										</li>
										<li>
											<Link
												href="/blog"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												المدونة
											</Link>
										</li>
										<li>
											<Link
												href="/privacy"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												سياسة الخصوصية
											</Link>
										</li>
										<li>
											<Link
												href="/terms"
												className="text-gray-300 hover:text-white transition-colors text-sm"
											>
												شروط الاستخدام
											</Link>
										</li>
									</ul>
								</div>
							</div>

							{/* Newsletter Signup */}
							<div className="mt-12 pt-8 border-t border-gray-800">
								<div className="max-w-md mx-auto text-center">
									<h3 className="text-lg font-semibold mb-2">
										ابق على اطلاع
									</h3>
									<p className="text-gray-300 text-sm mb-4">
										اشترك في نشرتنا الإخبارية للحصول على آخر
										التحديثات والنصائح
									</p>
									<div className="flex gap-2">
										<input
											type="email"
											placeholder="بريدك الإلكتروني"
											className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
										/>
										<button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
											اشترك
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Bar */}
						<div className="bg-gray-950 border-t border-gray-800">
							<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
								<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
									<div className="text-gray-400 text-sm">
										© 2025 بيلفورا. جميع الحقوق محفوظة.
									</div>
									<div className="flex items-center space-x-6 space-x-reverse text-sm">
										<Link
											href="/privacy"
											className="text-gray-400 hover:text-white transition-colors"
										>
											الخصوصية
										</Link>
										<Link
											href="/terms"
											className="text-gray-400 hover:text-white transition-colors"
										>
											الشروط
										</Link>
										<Link
											href="/cookies"
											className="text-gray-400 hover:text-white transition-colors"
										>
											ملفات تعريف الارتباط
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
