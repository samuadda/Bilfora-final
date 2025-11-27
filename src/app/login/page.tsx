"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Eye, EyeClosed, Check, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DotPattern } from "@/components/landing-page/dot-pattern";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [generalError, setGeneralError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	// Forgot password states
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const [resetEmail, setResetEmail] = useState("");
	const [resetEmailError, setResetEmailError] = useState("");
	const [isResetting, setIsResetting] = useState(false);
	const [resetSuccess, setResetSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	// Check for success messages from URL
	useEffect(() => {
		const message = searchParams.get("message");
		if (message === "password_reset_success") {
			setSuccessMessage(
				"تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
			);
		}
	}, [searchParams]);

	// Load remember me preference from localStorage on component mount
	useEffect(() => {
		const savedRememberMe = localStorage.getItem("rememberMe");
		if (savedRememberMe === "true") {
			setRememberMe(true);
		}
	}, []);

	// Handle remember me checkbox change
	const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const isChecked = e.target.checked;
		setRememberMe(isChecked);

		// Save preference to localStorage
		if (isChecked) {
			localStorage.setItem("rememberMe", "true");
		} else {
			localStorage.removeItem("rememberMe");
		}
	};

	// =============  تسجيل الدخول بالبريد =============
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		let isValid = true;

		setGeneralError("");
		setEmailError("");
		setPasswordError("");

		if (!email) {
			setEmailError("البريد الإلكتروني مطلوب");
			isValid = false;
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				setEmailError("صيغة البريد الإلكتروني غير صحيحة");
				isValid = false;
			}
		}

		if (!password) {
			setPasswordError("كلمة المرور مطلوبة");
			isValid = false;
		}

		if (!isValid) return;

		setIsLoading(true);
		setGeneralError("");

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			// Set session persistence based on remember me checkbox
			if (!error && rememberMe) {
				localStorage.setItem("rememberMe", "true");
			} else if (!error && !rememberMe) {
				localStorage.removeItem("rememberMe");
			}

			if (error) {
				let errorMessage = error.message;
				if (error.message.includes("Invalid login credentials")) {
					errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
				} else if (error.message.includes("Email not confirmed")) {
					errorMessage =
						"البريد الإلكتروني غير مفعل. يرجى التحقق من بريدك الإلكتروني";
				} else if (error.message.includes("Too many requests")) {
					errorMessage = "تم إرسال طلبات كثيرة. يرجى المحاولة لاحقاً";
				}
				setGeneralError(errorMessage);
				return;
			}

			// Login successful
			setGeneralError("");
			setSuccessMessage("تم تسجيل الدخول بنجاح!");

			setTimeout(() => {
				router.push("/dashboard");
			}, 1000);
		} catch (error) {
			console.error("Login Error:", error);
			setGeneralError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
		} finally {
			setIsLoading(false);
		}
	};

	// =============  إعادة تعيين كلمة المرور =============
	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!resetEmail.trim()) {
			setResetEmailError("البريد الإلكتروني مطلوب");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(resetEmail)) {
			setResetEmailError("البريد الإلكتروني غير صالح");
			return;
		}

		setIsResetting(true);
		setResetEmailError("");

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(
				resetEmail,
				{
					redirectTo: `${location.origin}/reset-password`,
				}
			);

			if (error) {
				setResetEmailError("حدث خطأ: " + error.message);
			} else {
				setResetSuccess(true);
			}
		} catch (err) {
			console.error("Password reset error:", err);
			setResetEmailError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
		} finally {
			setIsResetting(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		if (field === "email") {
			setEmail(value);
			setEmailError("");
		} else if (field === "password") {
			setPassword(value);
			setPasswordError("");
		} else if (field === "resetEmail") {
			setResetEmail(value);
			setResetEmailError("");
		}
		setGeneralError("");
	};

	return (
		<div className="w-full lg:grid lg:grid-cols-2 min-h-screen">
			{/* Right Side - Form */}
			<div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
				<Link
					href="/"
					className="absolute top-8 right-8 flex items-center gap-2 text-gray-500 hover:text-[#7f2dfb] transition-colors"
				>
					<ArrowLeft size={16} />
					<span>العودة للرئيسية</span>
				</Link>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mx-auto w-full max-w-sm lg:w-96"
				>
					<div className="flex flex-col items-start gap-2 mb-10">
						<Image
							src="/logoPNG.png"
							alt="Bilfora"
							width={140}
							height={40}
							className="h-10 w-auto mb-6"
						/>
						<h2 className="text-3xl font-bold tracking-tight text-[#012d46]">
							مرحباً بعودتك 👋
						</h2>
						<p className="text-sm text-gray-600">
							أدخل بياناتك للدخول إلى لوحة التحكم
						</p>
					</div>

					{successMessage && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
						>
							<div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
								<Check className="h-4 w-4 text-green-600" />
							</div>
							<p className="text-green-700 text-sm font-medium">
								{successMessage}
							</p>
						</motion.div>
					)}

					{generalError && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
						>
							<p className="text-red-600 text-sm font-medium">
								{generalError}
							</p>
						</motion.div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium leading-6 text-gray-900 mb-2"
							>
								البريد الإلكتروني
							</label>
							<div className="relative">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) =>
										handleInputChange(
											"email",
											e.target.value
										)
									}
									className={cn(
										"block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all",
										emailError &&
											"ring-red-300 focus:ring-red-500"
									)}
								/>
							</div>
							{emailError && (
								<p className="mt-2 text-sm text-red-600">
									{emailError}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium leading-6 text-gray-900 mb-2"
							>
								كلمة المرور
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) =>
										handleInputChange(
											"password",
											e.target.value
										)
									}
									className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7f2dfb] sm:text-sm sm:leading-6 transition-all"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
								>
									{showPassword ? (
										<EyeClosed size={18} />
									) : (
										<Eye size={18} />
									)}
								</button>
							</div>
							{passwordError && (
								<p className="mt-2 text-sm text-red-600">
									{passwordError}
								</p>
							)}
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									checked={rememberMe}
									onChange={handleRememberMeChange}
									className="h-4 w-4 rounded border-gray-300 text-[#7f2dfb] focus:ring-[#7f2dfb]"
								/>
								<label
									htmlFor="remember-me"
									className="mr-2 block text-sm leading-6 text-gray-900"
								>
									تذكرني
								</label>
							</div>

							<div className="text-sm leading-6">
								<button
									type="button"
									onClick={() => setShowForgotPassword(true)}
									className="font-semibold text-[#7f2dfb] hover:text-[#6a1fd8]"
								>
									نسيت كلمة المرور؟
								</button>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isLoading}
								className="flex w-full justify-center rounded-xl bg-[#012d46] px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#023b5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#012d46] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										<span>جاري الدخول...</span>
									</div>
								) : (
									"تسجيل الدخول"
								)}
							</button>
						</div>
					</form>

					<p className="mt-10 text-center text-sm text-gray-500">
						ليس لديك حساب؟{" "}
						<Link
							href="/register"
							className="font-semibold leading-6 text-[#7f2dfb] hover:text-[#6a1fd8]"
						>
							ابدأ تجربتك المجانية
						</Link>
					</p>
				</motion.div>
			</div>

			{/* Left Side - Visuals */}
			<div className="hidden lg:flex relative flex-1 flex-col justify-center items-center bg-[#0f172a] overflow-hidden">
				<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
				<DotPattern
					width={32}
					height={32}
					glow={true}
					className="[mask-image:linear-gradient(to_bottom,white,transparent)] opacity-30"
				/>

				<div className="relative z-10 w-full max-w-xl px-10">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<blockquote className="text-2xl font-medium leading-relaxed text-white text-center">
							&quot;بيلفورا غيّر طريقة تعاملي مع الفواتير تماماً.
							كنت أقضي ساعات كل شهر في إعدادها، الآن تأخذ مني
							دقائق معدودة.&quot;
						</blockquote>
						<div className="mt-8 flex flex-col items-center gap-4">
							<img
								className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
								src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
								alt="Abdullah Al-Otaibi"
							/>
							<div className="text-center">
								<div className="text-base font-semibold text-white">
									عبدالله العتيبي
								</div>
								<div className="text-sm text-gray-400">
									مصمم جرافيك مستقل
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Forgot Password Modal */}
			{showForgotPassword && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
					>
						{!resetSuccess ? (
							<>
								<h2 className="text-2xl font-bold text-gray-900 mb-2">
									استعادة كلمة المرور
								</h2>
								<p className="text-gray-500 mb-6">
									أدخل بريدك الإلكتروني وسنرسل لك تعليمات
									استعادة كلمة المرور.
								</p>

								<form onSubmit={handleForgotPassword}>
									<div className="mb-6">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											البريد الإلكتروني
										</label>
										<input
											type="email"
											value={resetEmail}
											onChange={(e) =>
												handleInputChange(
													"resetEmail",
													e.target.value
												)
											}
											className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] sm:text-sm py-3 px-4"
											placeholder="name@example.com"
											disabled={isResetting}
										/>
										{resetEmailError && (
											<p className="mt-2 text-sm text-red-600">
												{resetEmailError}
											</p>
										)}
									</div>

									<div className="flex gap-3">
										<button
											type="button"
											onClick={() => {
												setShowForgotPassword(false);
												setResetEmail("");
											}}
											className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
										>
											إلغاء
										</button>
										<button
											type="submit"
											disabled={isResetting}
											className="flex-1 px-4 py-3 bg-[#7f2dfb] text-white rounded-xl text-sm font-medium hover:bg-[#6a1fd8] transition-colors disabled:opacity-70"
										>
											{isResetting
												? "جاري الإرسال..."
												: "إرسال الرابط"}
										</button>
									</div>
								</form>
							</>
						) : (
							<div className="text-center py-4">
								<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<Check className="w-8 h-8 text-green-600" />
								</div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">
									تم إرسال الرابط!
								</h2>
								<p className="text-gray-500 mb-8">
									تفقد بريدك الإلكتروني للحصول على رابط
									استعادة كلمة المرور.
								</p>
								<button
									onClick={() => {
										setShowForgotPassword(false);
										setResetSuccess(false);
										setResetEmail("");
									}}
									className="w-full px-4 py-3 bg-[#7f2dfb] text-white rounded-xl text-sm font-medium hover:bg-[#6a1fd8] transition-colors"
								>
									حسناً، فهمت
								</button>
							</div>
						)}
					</motion.div>
				</div>
			)}
		</div>
	);
}
