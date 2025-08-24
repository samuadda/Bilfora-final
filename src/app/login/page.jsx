"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [generalError, setGeneralError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e) => {
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
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				setGeneralError("بيانات الدخول غير صحيحة أو الحساب غير موجود.");
				return;
			}

			router.push("/dashboard");
		} catch (error) {
			console.error("Login Error:", error);
			setGeneralError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (field, value) => {
		if (field === "email") {
			setEmail(value);
			setEmailError("");
		} else if (field === "password") {
			setPassword(value);
			setPasswordError("");
		}
		setGeneralError("");
	};

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
			<div className="relative w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 shadow-lg rounded-2xl sm:rounded-3xl bg-white z-10">
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

					{/* General Error Display */}
					{generalError && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-xs sm:text-sm text-center">
								{generalError}
							</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Email Field */}
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
							<div className="h-5 mt-1">
								{emailError && (
									<p className="text-red-500 text-xs">
										{emailError}
									</p>
								)}
							</div>
						</div>

						{/* Password Field */}
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
							<div className="h-5 mt-1">
								{passwordError && (
									<p className="text-red-500 text-xs">
										{passwordError}
									</p>
								)}
							</div>
						</div>

						{/* Remember Me & Forgot Password */}
						<div className="flex items-center justify-between">
							<label className="flex items-center space-x-2 rtl:space-x-reverse">
								<input
									type="checkbox"
									className="accent-purple-500"
									disabled={isLoading}
								/>
								<span className="text-xs sm:text-sm text-gray-600 mr-1.5">
									تذكرني
								</span>
							</label>
							<button
								type="button"
								className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-600 cursor-pointer hover:underline"
								disabled={isLoading}
							>
								نسيت كلمة المرور ؟
							</button>
						</div>

						{/* Login Button */}
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

						{/* Divider */}
						<div className="flex items-center space-x-2 rtl:space-x-reverse">
							<div className="h-px flex-1 bg-gray-300" />
							<p className="text-xs sm:text-sm text-gray-500 px-2">
								أو تابع باستخدام
							</p>
							<div className="h-px flex-1 bg-gray-300" />
						</div>

						{/* Social Login Buttons */}
						<div className="space-y-3">
							<button
								type="button"
								disabled={isLoading}
								className="flex items-center justify-center gap-2 w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-medium hover:bg-gray-100 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span className="hidden sm:inline">
									الدخول عبر آبل
								</span>
								<span className="sm:hidden">آبل</span>
								<svg
									viewBox="0 0 30 30"
									height={16}
									width={16}
									className="sm:h-5 sm:w-5"
									y="0px"
									x="0px"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M25.565,9.785c-0.123,0.077-3.051,1.702-3.051,5.305c0.138,4.109,3.695,5.55,3.756,5.55 c-0.061,0.077-0.537,1.963-1.947,3.94C23.204,26.283,21.962,28,20.076,28c-1.794,0-2.438-1.135-4.508-1.135 c-2.223,0-2.852,1.135-4.554,1.135c-1.886,0-3.22-1.809-4.4-3.496c-1.533-2.208-2.836-5.673-2.882-9 c-0.031-1.763,0.307-3.496,1.165-4.968c1.211-2.055,3.373-3.45,5.734-3.496c1.809-0.061,3.419,1.242,4.523,1.242 c1.058,0,3.036-1.242,5.274-1.242C21.394,7.041,23.97,7.332,25.565,9.785z M15.001,6.688c-0.322-1.61,0.567-3.22,1.395-4.247 c1.058-1.242,2.729-2.085,4.17-2.085c0.092,1.61-0.491,3.189-1.533,4.339C18.098,5.937,16.488,6.872,15.001,6.688z" />
								</svg>
							</button>
							<button
								type="button"
								disabled={isLoading}
								className="flex items-center justify-center gap-2 w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-medium hover:bg-gray-100 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span className="hidden sm:inline">
									الدخول عبر جوجل
								</span>
								<span className="sm:hidden">جوجل</span>
								<svg
									viewBox="0 0 24 24"
									height={16}
									width={16}
									className="sm:h-5 sm:w-5"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M12 5c1.62 0 3.1.55 4.29 1.47l3.64-3.47C17.81 1.14 15.04 0 12 0 7.39 0 3.4 2.6 1.39 6.41l4.04 3.19C6.41 6.92 8.98 5 12 5z"
										fill="#F44336"
									/>
									<path
										d="M23.9 13.5c.06-.49.1-.99.1-1.5 0-.86-.09-1.69-.26-2.5H12v5h6.49c-.52 1.36-1.46 2.52-2.65 3.32l4.06 3.2c2.17-2.39 3.64-5.03 4-7.99z"
										fill="#2196F3"
									/>
									<path
										d="M5 12c0-.84.16-1.65.43-2.4L1.39 6.41C.5 8.08 0 9.98 0 12c0 2 0.5 3.88 1.36 5.53l4.05-3.2C5.15,13.6 5 12.82 5 12z"
										fill="#FFC107"
									/>
									<path
										d="M12 19c-3.05 0-5.63-1.95-6.59-4.66L1.36 17.53C3.36 21.37 7.37 24 12 24c3.03 0 5.79-1.12 7.9-2.98l-4.06-3.2C14.74 18.56 13.43 19 12 19z"
										fill="#00B060"
									/>
								</svg>
							</button>
						</div>

						{/* Sign Up Link */}
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
		</div>
	);
}
