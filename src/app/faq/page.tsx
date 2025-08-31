"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronDown,
	ChevronUp,
	HelpCircle,
	FileText,
	CreditCard,
	Shield,
	Smartphone,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import SimpleNavbar from "@/components/landing-page/SimpleNavbar";

interface FAQItem {
	id: number;
	question: string;
	answer: string;
	category: string;
	icon: React.ReactNode;
}

const faqData: FAQItem[] = [
	{
		id: 1,
		question: "كيف يمكنني إنشاء فاتورة جديدة؟",
		answer: "يمكنك إنشاء فاتورة جديدة بسهولة من خلال الضغط على زر 'إنشاء فاتورة' في لوحة التحكم، ثم ملء البيانات المطلوبة مثل معلومات العميل والمنتجات والخدمات.",
		category: "الاستخدام الأساسي",
		icon: <FileText className="w-5 h-5" />,
	},
	{
		id: 2,
		question: "هل يمكنني تخصيص تصميم الفواتير؟",
		answer: "نعم! يمكنك تخصيص تصميم الفواتير بالكامل من خلال اختيار القوالب المتاحة أو إنشاء تصميم خاص بك باستخدام أدوات التصميم المتقدمة.",
		category: "التخصيص",
		icon: <FileText className="w-5 h-5" />,
	},
	{
		id: 3,
		question: "كيف يمكنني إرسال الفواتير للعملاء؟",
		answer: "يمكنك إرسال الفواتير عبر البريد الإلكتروني مباشرة من النظام، أو تحميلها كملف PDF وإرسالها بالطريقة التي تفضلها.",
		category: "الاستخدام الأساسي",
		icon: <FileText className="w-5 h-5" />,
	},
	{
		id: 4,
		question: "هل النظام يدعم المدفوعات الإلكترونية؟",
		answer: "نعم، النظام يدعم العديد من بوابات الدفع الإلكترونية مثل PayPal وStripe وMada، مما يتيح للعملاء الدفع بسهولة وأمان.",
		category: "المدفوعات",
		icon: <CreditCard className="w-5 h-5" />,
	},
	{
		id: 5,
		question: "كيف يمكنني تتبع حالة الفواتير؟",
		answer: "يمكنك تتبع حالة جميع الفواتير من لوحة التحكم، حيث ستجد معلومات مفصلة عن الفواتير المدفوعة والمعلقة والمتأخرة.",
		category: "التتبع",
		icon: <FileText className="w-5 h-5" />,
	},
	{
		id: 6,
		question: "هل بياناتي آمنة في النظام؟",
		answer: "نعم، نستخدم أحدث تقنيات التشفير وأمان البيانات لحماية معلوماتك ومعلومات عملائك. جميع البيانات مشفرة ومخزنة بأمان عالي.",
		category: "الأمان",
		icon: <Shield className="w-5 h-5" />,
	},
	{
		id: 7,
		question: "هل يمكنني استخدام النظام من الهاتف المحمول؟",
		answer: "نعم، النظام متوافق تماماً مع جميع الأجهزة المحمولة. يمكنك إنشاء وإدارة الفواتير من أي مكان وفي أي وقت.",
		category: "الوصول",
		icon: <Smartphone className="w-5 h-5" />,
	},
	{
		id: 8,
		question: "كيف يمكنني إضافة فريق عمل للنظام؟",
		answer: "يمكنك إضافة أعضاء الفريق من خلال إعدادات الحساب، مع إمكانية تحديد الصلاحيات المختلفة لكل عضو حسب دوره في العمل.",
		category: "الفريق",
		icon: <Users className="w-5 h-5" />,
	},
	{
		id: 9,
		question: "هل النظام يدعم اللغات المتعددة؟",
		answer: "نعم، النظام يدعم اللغة العربية والإنجليزية، مع إمكانية إضافة لغات أخرى حسب احتياجاتك.",
		category: "اللغة",
		icon: <FileText className="w-5 h-5" />,
	},
	{
		id: 10,
		question: "كيف يمكنني تصدير التقارير؟",
		answer: "يمكنك تصدير التقارير بسهولة بصيغ مختلفة مثل Excel وPDF، مما يتيح لك تحليل البيانات ومراجعتها خارج النظام.",
		category: "التقارير",
		icon: <FileText className="w-5 h-5" />,
	},
	{
		id: 11,
		question: "هل النظام يعمل بدون إنترنت؟",
		answer: "نعم، النظام يعمل في وضع عدم الاتصال، حيث يمكنك إنشاء الفواتير وحفظها محلياً، ثم مزامنتها عند عودة الاتصال بالإنترنت.",
		category: "الوصول",
		icon: <Zap className="w-5 h-5" />,
	},
	{
		id: 12,
		question: "كيف يمكنني الحصول على الدعم الفني؟",
		answer: "يمكنك التواصل مع فريق الدعم الفني من خلال صفحة 'تواصل معنا' أو عبر البريد الإلكتروني. نحن متواجدون لمساعدتك على مدار الساعة.",
		category: "الدعم",
		icon: <HelpCircle className="w-5 h-5" />,
	},
];

const categories = [
	{ name: "الكل", value: "all", icon: <FileText className="w-4 h-4" /> },
	{
		name: "الاستخدام الأساسي",
		value: "الاستخدام الأساسي",
		icon: <FileText className="w-4 h-4" />,
	},
	{
		name: "التخصيص",
		value: "التخصيص",
		icon: <FileText className="w-4 h-4" />,
	},
	{
		name: "المدفوعات",
		value: "المدفوعات",
		icon: <CreditCard className="w-4 h-4" />,
	},
	{ name: "الأمان", value: "الأمان", icon: <Shield className="w-4 h-4" /> },
	{
		name: "الوصول",
		value: "الوصول",
		icon: <Smartphone className="w-4 h-4" />,
	},
	{ name: "الفريق", value: "الفريق", icon: <Users className="w-4 h-4" /> },
	{ name: "الدعم", value: "الدعم", icon: <HelpCircle className="w-4 h-4" /> },
];

export default function FAQPage() {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [openItems, setOpenItems] = useState<number[]>([]);

	const filteredFAQs =
		selectedCategory === "all"
			? faqData
			: faqData.filter((faq) => faq.category === selectedCategory);

	const toggleItem = (id: number) => {
		setOpenItems((prev) =>
			prev.includes(id)
				? prev.filter((item) => item !== id)
				: [...prev, id]
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#012d46] via-[#7f2dfb] to-[#ff6b9d] relative overflow-hidden">
			{/* Background Pattern */}
			<DotPattern className="absolute inset-0 opacity-10" />

			{/* Navigation */}
			<SimpleNavbar />

			{/* Header Section */}
			<div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-4xl mx-auto"
				>
					<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
						<HelpCircle className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
						الأسئلة الشائعة
					</h1>
					<p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
						إجابات على أكثر الأسئلة شيوعاً حول نظام إدارة الفواتير
					</p>
				</motion.div>
			</div>

			{/* Category Filter */}
			<div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="max-w-6xl mx-auto"
				>
					<div className="flex flex-wrap justify-center gap-3">
						{categories.map((category) => (
							<button
								key={category.value}
								onClick={() =>
									setSelectedCategory(category.value)
								}
								className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
									selectedCategory === category.value
										? "bg-white text-[#012d46] shadow-lg"
										: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
								}`}
							>
								{category.icon}
								{category.name}
							</button>
						))}
					</div>
				</motion.div>
			</div>

			{/* FAQ Content */}
			<div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="max-w-4xl mx-auto"
				>
					<AnimatePresence mode="wait">
						{filteredFAQs.map((faq, index) => (
							<motion.div
								key={faq.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{
									duration: 0.3,
									delay: index * 0.1,
								}}
								className="mb-4"
							>
								<div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
									<button
										onClick={() => toggleItem(faq.id)}
										className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-white/10 transition-all duration-200"
									>
										<div className="flex items-center gap-3">
											<div className="text-[#7f2dfb]">
												{faq.icon}
											</div>
											<span className="text-white font-semibold text-lg">
												{faq.question}
											</span>
										</div>
										<div className="text-white">
											{openItems.includes(faq.id) ? (
												<ChevronUp className="w-5 h-5" />
											) : (
												<ChevronDown className="w-5 h-5" />
											)}
										</div>
									</button>

									<AnimatePresence>
										{openItems.includes(faq.id) && (
											<motion.div
												initial={{
													height: 0,
													opacity: 0,
												}}
												animate={{
													height: "auto",
													opacity: 1,
												}}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.3 }}
												className="overflow-hidden"
											>
												<div className="px-6 pb-4">
													<p className="text-white/90 leading-relaxed">
														{faq.answer}
													</p>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			</div>

			{/* CTA Section */}
			<div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					className="max-w-4xl mx-auto text-center"
				>
					<div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 md:p-12">
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
							لم تجد إجابة لسؤالك؟
						</h2>
						<p className="text-xl text-white/90 mb-8">
							فريق الدعم الفني جاهز لمساعدتك في أي وقت
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link href="/contact">
								<MainButton
									text="تواصل معنا"
									bgColor="bg-white"
									textColor="text-[#012d46]"
									hoverBgColor="hover:bg-gray-100"
									className="text-lg px-8 py-3"
								/>
							</Link>
							<Link href="/dashboard">
								<MainButton
									text="جرب النظام"
									bgColor="bg-[#7f2dfb]"
									textColor="text-white"
									hoverBgColor="hover:bg-[#6a1fd8]"
									className="text-lg px-8 py-3"
								/>
							</Link>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
