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

	// =============  تحديث الحقول =============
	const handleInputChange = (field: string, value: string) => {
		if (field === "email") {
			setEmail(value);
			setEmailError("");
		} else if (field === "password") {
			setPassword(value);
			setPasswordError("");
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
									disabled={isLoading}
								/>
								<span className="text-xs sm:text-sm text-gray-600 mr-1.5">
									تذكرني
								</span>
							</label>
							<button
								type="button"
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
		</div>
	);
}
