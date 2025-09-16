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
						src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
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
					<div className="max-w-[80%] mx-auto relative flex flex-col justify-center items-center gap-10 min-w-2/3 text-sm py-6 md:py-10 md:px-5 lg:py-20 lg:px-10 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-400 overflow-hidden">
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
							<button className="relative z-10 px-10 py-1.5 rounded-4xl text-[#012d46] font-semibold bg-white cursor-pointer active:translate-y-1 shadow-neutral-500">
								جرّب الآن
							</button>
						</Link>
					</div>
					<div className="flex border-t mt-20 py-10 px-10 items-center justify-between max-w-[90%] mx-auto">
						<ul className="flex flex-col md:flex-row gap-7">
							<li>
								<Link href="/privacy">الخصوصية</Link>
							</li>
							<li>
								<Link href="/support">الدعم</Link>
							</li>
							<li>
								<Link href="/terms">الشروط</Link>
							</li>
							<li>
								<Link href="/contact">البريد</Link>
							</li>
						</ul>
						<Link
							href="/"
							className="hidden sm:inline-block shrink-1 mx-5"
						>
							<Image
								src="/logo-ar-purple.svg"
								alt="logo"
								width={120}
								height={120}
							></Image>
						</Link>
						<ul className="flex flex-col md:flex-row gap-7">
							<li>
								<Link
									href="https://youtube.com/@bilfora"
									target="_blank"
									rel="noopener noreferrer"
								>
									اليوتيوب
								</Link>
							</li>
							<li>
								<Link
									href="https://x.com/bilfora"
									target="_blank"
									rel="noopener noreferrer"
								>
									اكــس
								</Link>
							</li>
							<li>
								<Link
									href="https://instagram.com/bilfora"
									target="_blank"
									rel="noopener noreferrer"
								>
									انستقرام
								</Link>
							</li>
							<li>
								<Link
									href="https://linkedin.com/company/bilfora"
									target="_blank"
									rel="noopener noreferrer"
								>
									لينكد إن
								</Link>
							</li>
						</ul>
					</div>
				</footer>
			</div>
		</>
	);
}
