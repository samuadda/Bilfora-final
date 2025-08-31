"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Mail,
	Phone,
	MapPin,
	Send,
	MessageCircle,
	User,
	Building,
	Globe,
} from "lucide-react";
import MainButton from "@/components/MainButton";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import SimpleNavbar from "@/components/landing-page/SimpleNavbar";

interface ContactForm {
	name: string;
	email: string;
	company: string;
	subject: string;
	message: string;
}

const contactMethods = [
	{
		icon: <Mail className="w-6 h-6 text-white" />,
		title: "البريد الإلكتروني",
		value: "support@bilfora.com",
		description: "راسلنا عبر البريد الإلكتروني",
	},
	{
		icon: <Phone className="w-6 h-6 text-white" />,
		title: "الهاتف",
		value: "+966 50 123 4567",
		description: "اتصل بنا مباشرة",
	},
	{
		icon: <MapPin className="w-6 h-6 text-white" />,
		title: "العنوان",
		value: "الرياض، المملكة العربية السعودية",
		description: "مقر الشركة الرئيسي",
	},
];

const supportCategories = [
	{ name: "الدعم الفني", icon: <MessageCircle className="w-5 h-5" /> },
	{ name: "المبيعات", icon: <Building className="w-5 h-5" /> },
	{ name: "الشكاوى", icon: <MessageCircle className="w-5 h-5" /> },
	{ name: "الاقتراحات", icon: <Globe className="w-5 h-5" /> },
];

export default function ContactPage() {
	const [formData, setFormData] = useState<ContactForm>({
		name: "",
		email: "",
		company: "",
		subject: "",
		message: "",
	});
	const [selectedCategory, setSelectedCategory] = useState("الدعم الفني");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Simulate form submission
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Reset form
		setFormData({
			name: "",
			email: "",
			company: "",
			subject: "",
			message: "",
		});
		setSelectedCategory("الدعم الفني");
		setIsSubmitting(false);

		// Show success message (you can implement a toast notification here)
		alert("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
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
						<MessageCircle className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
						تواصل معنا
					</h1>
					<p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
						نحن هنا لمساعدتك! تواصل مع فريق الدعم الفني للحصول على
						المساعدة التي تحتاجها
					</p>
				</motion.div>
			</div>

			{/* Contact Methods */}
			<div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="max-w-6xl mx-auto"
				>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{contactMethods.map((method, index) => (
							<motion.div
								key={method.title}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.6,
									delay: 0.3 + index * 0.1,
								}}
								className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center hover:bg-white/20 transition-all duration-200"
							>
								<div className="inline-flex items-center justify-center w-12 h-12 bg-[#7f2dfb] rounded-full mb-4">
									{method.icon}
								</div>
								<h3 className="text-lg font-semibold text-white mb-2">
									{method.title}
								</h3>
								<p className="text-white font-medium mb-2">
									{method.value}
								</p>
								<p className="text-white/90 text-sm">
									{method.description}
								</p>
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>

			{/* Main Contact Form */}
			<div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="max-w-4xl mx-auto"
				>
					<div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 md:p-12">
						<div className="text-center mb-8">
							<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
								راسلنا{" "}
							</h2>
							<p className="text-xl text-white/90">
								سنرد عليك في أقرب وقت ممكن
							</p>
						</div>

						{/* Category Selection */}
						<div className="mb-8">
							<label className="block text-white font-semibold mb-4 text-right">
								نوع الاستفسار
							</label>
							<div className="flex flex-wrap gap-3 justify-center">
								{supportCategories.map((category) => (
									<button
										key={category.name}
										onClick={() =>
											setSelectedCategory(category.name)
										}
										className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
											selectedCategory === category.name
												? "bg-white text-[#012d46] shadow-lg"
												: "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
										}`}
									>
										{category.icon}
										{category.name}
									</button>
								))}
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-white font-semibold mb-2 text-right">
										الاسم الكامل *
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
											<User className="h-5 w-5 text-white/70" />
										</div>
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleInputChange}
											required
											className="w-full pr-10 pl-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb] focus:border-transparent transition-all duration-200"
											placeholder="أدخل اسمك الكامل"
										/>
									</div>
								</div>

								<div>
									<label className="block text-white font-semibold mb-2 text-right">
										البريد الإلكتروني *
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
											<Mail className="h-5 w-5 text-white/70" />
										</div>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											required
											className="w-full pr-10 pl-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb] focus:border-transparent transition-all duration-200"
											placeholder="أدخل بريدك الإلكتروني"
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-white font-semibold mb-2 text-right">
										اسم الشركة
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
											<Building className="h-5 w-5 text-white/70" />
										</div>
										<input
											type="text"
											name="company"
											value={formData.company}
											onChange={handleInputChange}
											className="w-full pr-10 pl-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb] focus:border-transparent transition-all duration-200"
											placeholder="أدخل اسم شركتك (اختياري)"
										/>
									</div>
								</div>

								<div>
									<label className="block text-white font-semibold mb-2 text-right">
										الموضوع *
									</label>
									<input
										type="text"
										name="subject"
										value={formData.subject}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb] focus:border-transparent transition-all duration-200"
										placeholder="أدخل موضوع الرسالة"
									/>
								</div>
							</div>

							<div>
								<label className="block text-white font-semibold mb-2 text-right">
									الرسالة *
								</label>
								<textarea
									name="message"
									value={formData.message}
									onChange={handleInputChange}
									required
									rows={6}
									className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb] focus:border-transparent transition-all duration-200 resize-none"
									placeholder="اكتب رسالتك هنا..."
								/>
							</div>

							<div className="text-center pt-4">
								<MainButton
									text={
										isSubmitting
											? "جاري الإرسال..."
											: "إرسال الرسالة"
									}
									bgColor="bg-[#7f2dfb]"
									textColor="text-white"
									hoverBgColor="hover:bg-[#6a1fd8]"
									className="text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={isSubmitting}
									rightIcon={
										isSubmitting ? undefined : (
											<Send className="w-5 h-5" />
										)
									}
								/>
							</div>
						</form>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
