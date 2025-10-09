"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { useSearchParams } from "next/navigation";

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
				// For "remember me", we can set a longer session duration
				// This is handled by Supabase's default session management
				// The session will persist until explicitly signed out
				console.log("Remember me enabled - session will persist");

				// Store user preference for future sessions
				localStorage.setItem("rememberMe", "true");
			} else if (!error && !rememberMe) {
				// Clear remember me preference if unchecked
				localStorage.removeItem("rememberMe");
			}

			if (error) {
				// Translate common error messages to Arabic
				let errorMessage = error.message;
				if (error.message.includes("Invalid login credentials")) {
					errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
				} else if (error.message.includes("Email not confirmed")) {
					errorMessage =
						"البريد الإلكتروني غير مفعل. يرجى التحقق من بريدك الإلكتروني";
				} else if (error.message.includes("Too many requests")) {
					errorMessage = "تم إرسال طلبات كثيرة. يرجى المحاولة لاحقاً";
				} else if (error.message.includes("User not found")) {
					errorMessage = "المستخدم غير موجود";
				} else if (error.message.includes("Invalid email")) {
					errorMessage = "البريد الإلكتروني غير صالح";
				} else if (error.message.includes("Invalid password")) {
					errorMessage = "كلمة المرور غير صحيحة";
				}
				setGeneralError("فشل تسجيل الدخول: " + errorMessage);
				return;
			}

			// Login successful - show success message
			setGeneralError("");
			if (rememberMe) {
				setSuccessMessage(
					"تم تسجيل الدخول بنجاح! سيتم تذكرك في المرات القادمة."
				);
			} else {
				setSuccessMessage("تم تسجيل الدخول بنجاح!");
			}

			// Redirect to dashboard
			setTimeout(() => {
				router.push("/dashboard");
			}, 1500);
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

		// Validate email
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
				// Translate common error messages to Arabic
				let errorMessage = error.message;
				if (error.message.includes("User not found")) {
					errorMessage = "المستخدم غير موجود";
				} else if (error.message.includes("Invalid email")) {
					errorMessage = "البريد الإلكتروني غير صالح";
				} else if (error.message.includes("Email not confirmed")) {
					errorMessage = "البريد الإلكتروني غير مفعل";
				} else if (error.message.includes("Too many requests")) {
					errorMessage = "تم إرسال طلبات كثيرة. يرجى المحاولة لاحقاً";
				} else if (
					error.message.includes("Email rate limit exceeded")
				) {
					errorMessage =
						"تم تجاوز الحد المسموح من طلبات البريد الإلكتروني";
				}
				setResetEmailError("حدث خطأ: " + errorMessage);
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

	// =============  تحديث الحقول =============
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

	// =============  واجهة الصفحة =============
	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-t from-[#cc15ff3d] to-[#fff] p-4 sm:p-6 lg:p-8">
			<DotPattern
				width={16}
				height={16}
				glow={true}
				className={cn(
					"[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
				)}
			/>
			<div
				className={`relative w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 shadow-lg rounded-2xl sm:rounded-3xl bg-white z-10 transition-opacity duration-300 ${
					showForgotPassword
						? "opacity-0 pointer-events-none"
						: "opacity-100"
				}`}
			>
				<div className="w-full">
					<div className="text-center mb-6">
						<h1 className="text-lg sm:text-xl font-bold flex items-center justify-center gap-2">
							<span>هلا بك مرة ثانية في</span>
							<Image
								src="/logo-ar-navy.svg"
								alt="logo"
								width={60}
								height={60}
								className="w-12 h-12 sm:w-16 sm:h-16"
								priority
							/>
						</h1>
					</div>

					{/* Success Message */}
					{successMessage && (
						<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-green-600 text-xs sm:text-sm text-center">
								{successMessage}
							</p>
						</div>
					)}

					{/* Error عام */}
					{generalError && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-xs sm:text-sm text-center">
								{generalError}
							</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* البريد */}
						<div>
							<label
								htmlFor="email"
								className="font-semibold text-xs sm:text-sm text-gray-600 pb-1 block"
							>
								البريد الإلكتروني
							</label>
							<input
								className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
								type="email"
								id="email"
								value={email}
								onChange={(e) =>
									handleInputChange("email", e.target.value)
								}
								disabled={isLoading}
								placeholder="أدخل بريدك الإلكتروني"
							/>
							{emailError && (
								<p className="text-red-500 text-xs mt-1">
									{emailError}
								</p>
							)}
						</div>

						{/* كلمة المرور */}
						<div>
							<label
								htmlFor="password"
								className="font-semibold text-xs sm:text-sm text-gray-600 pb-1 block"
							>
								كلمة المرور
							</label>
							<div className="relative">
								<input
									className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300 pr-10"
									type={showPassword ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) =>
										handleInputChange(
											"password",
											e.target.value
										)
									}
									disabled={isLoading}
									placeholder="أدخل كلمة المرور"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
									disabled={isLoading}
								>
									{showPassword ? (
										<EyeClosed
											size={16}
											strokeWidth={1.75}
										/>
									) : (
										<Eye size={16} strokeWidth={1.75} />
									)}
								</button>
							</div>
							{passwordError && (
								<p className="text-red-500 text-xs mt-1">
									{passwordError}
								</p>
							)}
						</div>

						{/* تذكرني ونسيت كلمة المرور */}
						<div className="flex items-center justify-between">
							<label className="flex items-center space-x-2 rtl:space-x-reverse">
								<input
									type="checkbox"
									className="accent-purple-500"
									checked={rememberMe}
									onChange={handleRememberMeChange}
									disabled={isLoading}
								/>
								<span className="text-xs sm:text-sm text-gray-600 mr-1.5">
									تذكرني
								</span>
							</label>
							<button
								type="button"
								onClick={() => setShowForgotPassword(true)}
								className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-700 cursor-pointer hover:underline"
								disabled={isLoading}
							>
								نسيت كلمة المرور ؟
							</button>
						</div>

						{/* زر الدخول */}
						<button
							type="submit"
							disabled={isLoading}
							className={`w-full text-white rounded-lg px-3 py-2.5 text-xs sm:text-sm font-semibold transition duration-100 flex items-center justify-center gap-2 ${
								isLoading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-[#7f2dfb] hover:bg-violet-400"
							}`}
						>
							{isLoading ? (
								<>
									<div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
									<span className="text-xs sm:text-sm">
										جاري الدخول...
									</span>
								</>
							) : (
								"دخول"
							)}
						</button>

						{/* فاصل */}

						{/* رابط إنشاء حساب */}
						<div className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
							ليس لديك حساب؟{" "}
							<Link
								href="/register"
								className="underline font-semibold text-black hover:text-purple-600 transition-colors"
							>
								أنشئ حساب جديد
							</Link>
						</div>
					</form>
				</div>
			</div>

			{/* Forgot Password Modal */}
			{showForgotPassword && (
				<div className="fixed inset-0 bg-gradient-to-t from-[#cc15ff3d] to-[#fff] bg-opacity-90 flex items-center justify-center p-4 z-50">
					<DotPattern
						width={16}
						height={16}
						glow={true}
						className={cn(
							"absolute inset-0 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
						)}
					/>
					<div className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl">
						{!resetSuccess ? (
							<>
								<h2 className="text-xl font-bold text-center mb-4">
									إعادة تعيين كلمة المرور
								</h2>
								<p className="text-sm text-gray-600 text-center mb-6">
									أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة
									تعيين كلمة المرور
								</p>

								<form onSubmit={handleForgotPassword}>
									<div className="mb-4">
										<label
											htmlFor="resetEmail"
											className="font-semibold text-sm text-gray-600 pb-1 block"
										>
											البريد الإلكتروني
										</label>
										<input
											type="email"
											id="resetEmail"
											value={resetEmail}
											onChange={(e) =>
												handleInputChange(
													"resetEmail",
													e.target.value
												)
											}
											className="border rounded-lg px-3 py-2 mt-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
											placeholder="أدخل بريدك الإلكتروني"
											disabled={isResetting}
										/>
										{resetEmailError && (
											<p className="text-red-500 text-xs mt-1">
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
												setResetEmailError("");
											}}
											className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
											disabled={isResetting}
										>
											إلغاء
										</button>
										<button
											type="submit"
											disabled={isResetting}
											className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white ${
												isResetting
													? "bg-gray-400 cursor-not-allowed"
													: "bg-purple-600 hover:bg-purple-700"
											}`}
										>
											{isResetting
												? "جاري الإرسال..."
												: "إرسال الرابط"}
										</button>
									</div>
								</form>
							</>
						) : (
							<div className="text-center">
								<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg
										className="w-8 h-8 text-green-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<h2 className="text-xl font-bold text-green-600 mb-2">
									تم إرسال الرابط!
								</h2>
								<p className="text-sm text-gray-600 mb-6">
									تم إرسال رابط إعادة تعيين كلمة المرور إلى
									بريدك الإلكتروني. تحقق من صندوق الوارد أو
									مجلد الرسائل المهملة.
								</p>
								<button
									onClick={() => {
										setShowForgotPassword(false);
										setResetEmail("");
										setResetEmailError("");
										setResetSuccess(false);
									}}
									className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
								>
									حسناً
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
