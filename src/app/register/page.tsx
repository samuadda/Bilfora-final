"use client";

import Link from "next/link";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/dialog";

const Form = () => {
	const [formData, setFormData] = useState({
		fullname: "",
		email: "",
		phone: "",
		password: "",
		dob: "",
		gender: "male", // 'male' | 'female' | 'institute'
	});

	const router = useRouter();

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState("");

	// ===== Utils =====
	const calculateAge = (dob: string) => {
		const birthDate = new Date(dob);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
		return age;
	};

	// 05xxxxxxxx -> +9665xxxxxxxx (E.164)
	const normalizeSaPhone = (p: string) =>
		p
			.replace(/\D/g, "")
			.replace(/^966/, "")
			.replace(/^0/, "")
			.replace(/^5/, "+9665");

	const validate = () => {
		const newErrors: Record<string, string> = {};
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^05\d{8}$/; // إدخال المستخدم
		// 8+ chars, at least 1 letter & 1 digit (يسمح بالرموز)
		const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

		if (!formData.fullname.trim())
			newErrors.fullname = "الاسم الكامل مطلوب";

		if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
		else if (!emailRegex.test(formData.email))
			newErrors.email = "البريد الإلكتروني غير صالح";

		if (!formData.phone.trim()) newErrors.phone = "رقم الجوال مطلوب";
		else if (!phoneRegex.test(formData.phone))
			newErrors.phone = "رقم الجوال غير صالح (مثال: 05xxxxxxxx)";

		if (!formData.password) newErrors.password = "كلمة المرور مطلوبة";
		else if (!passwordRegex.test(formData.password))
			newErrors.password =
				"كلمة المرور يجب أن تكون 8 خانات على الأقل، وتحتوي على حرف ورقم على الأقل";

		if (!formData.dob) newErrors.dob = "تاريخ الميلاد مطلوب";
		else if (calculateAge(formData.dob) < 13)
			newErrors.dob = "يجب أن يكون عمرك 13 سنة أو أكثر";

		return newErrors;
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
		setGeneralError("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setIsLoading(true);
		setGeneralError("");

		try {
			const phoneE164 = normalizeSaPhone(formData.phone);

			const { data, error } = await supabase.auth.signUp({
				email: formData.email,
				password: formData.password,
				options: {
					emailRedirectTo: `${location.origin}/auth/callback`,
					data: {
						full_name: formData.fullname,
						phone: phoneE164,
						dob: formData.dob,
						account_type:
							formData.gender === "institute"
								? "business"
								: "individual",
						gender:
							formData.gender === "institute"
								? null
								: formData.gender,
					},
				},
			});

			if (error) {
				// أخطاء شائعة
				// @ts-ignore
				if (error.code === "user_already_registered") {
					setGeneralError(
						"هذا البريد مسجّل مسبقًا. جرّب تسجيل الدخول."
					);
				} else {
					setGeneralError("فشل التسجيل: " + error.message);
				}
				// أفرغ كلمة المرور للأمان (اختياري)
				setFormData((p) => ({ ...p, password: "" }));
				return;
			}

			setShowConfirmModal(true);
		} catch (err: any) {
			console.error("Unexpected Error:", err);
			setGeneralError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
		} finally {
			setIsLoading(false);
		}
	};

	// ===== OAuth Providers =====
	const onGoogle = async () => {
		setGeneralError("");
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${location.origin}/auth/callback` },
		});
		if (error) setGeneralError(error.message);
	};

	const onApple = async () => {
		setGeneralError("");
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "apple",
			options: { redirectTo: `${location.origin}/auth/callback` },
		});
		if (error) setGeneralError(error.message);
	};

	// ===== Password strength meter =====
	const getPasswordStrength = (password: string) => {
		if (!password) return { strength: 0, color: "bg-gray-200", text: "" };

		let score = 0;
		if (password.length >= 8) score++;
		if (/[A-Za-z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^A-Za-z\d]/.test(password)) score++; // يسمح بالرموز
		if (score <= 1)
			return { strength: score, color: "bg-red-500", text: "ضعيفة" };
		if (score === 2)
			return { strength: score, color: "bg-yellow-500", text: "متوسطة" };
		if (score === 3)
			return { strength: score, color: "bg-blue-500", text: "جيدة" };
		return { strength: score, color: "bg-green-500", text: "قوية" };
	};

	const passwordStrength = getPasswordStrength(formData.password);

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
			<form
				onSubmit={handleSubmit}
				className="relative w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 shadow-lg rounded-2xl sm:rounded-3xl bg-white"
			>
				<div className="w-full">
					<h1 className="text-lg sm:text-xl font-bold flex items-center justify-center gap-2 mb-4">
						<Image
							src="/logo-ar-navy.svg"
							alt="logo"
							width={60}
							height={60}
							className="w-12 h-12 sm:w-16 sm:h-16"
							priority
						/>
					</h1>

					{/* General Error */}
					{generalError && (
						<div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-xs sm:text-sm text-center">
								{generalError}
							</p>
						</div>
					)}

					<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						<div className="sm:col-span-2 sm:col-start-1">
							<label
								htmlFor="fullname"
								className="font-semibold text-xs sm:text-sm text-gray-600 pb-1 block"
							>
								الاسم الكامل
							</label>
							<input
								type="text"
								id="fullname"
								name="fullname"
								value={formData.fullname}
								onChange={handleChange}
								className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs mt-1 h-4">
								{errors.fullname || "\u00A0"}
							</p>
						</div>

						<div>
							<label
								htmlFor="email"
								className="font-semibold text-xs sm:text-sm text-gray-600 pb-1 block"
							>
								البريد الإلكتروني
							</label>
							<input
								type="email"
								name="email"
								id="email"
								value={formData.email}
								onChange={handleChange}
								className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs mt-1 h-4">
								{errors.email || "\u00A0"}
							</p>
						</div>

						<div>
							<label
								htmlFor="phone"
								className="font-semibold text-xs sm:text-sm pb-1 block text-gray-600"
							>
								رقم الجوال
							</label>
							<input
								type="tel"
								name="phone"
								id="phone"
								value={formData.phone}
								onChange={handleChange}
								className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
								placeholder="05xxxxxxxx"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs mt-1 h-4">
								{errors.phone || "\u00A0"}
							</p>
						</div>

						<div className="sm:col-span-2">
							<label
								htmlFor="password"
								className="font-semibold text-xs sm:text-sm text-gray-600 pb-1 block"
							>
								كلمة المرور
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									id="password"
									value={formData.password}
									onChange={handleChange}
									className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300 pr-10"
									disabled={isLoading}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((s) => !s)}
									className="absolute inset-y-0 right-2 flex items-center text-xs sm:text-sm text-gray-500 hover:text-gray-700"
									disabled={isLoading}
								>
									{showPassword ? "إخفاء" : "إظهار"}
								</button>
							</div>

							{/* Password Strength */}
							{formData.password && (
								<div className="mt-2">
									<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
										<div className="flex gap-1 justify-center sm:justify-start">
											{[1, 2, 3, 4].map((level) => (
												<div
													key={level}
													className={`h-1 w-6 sm:w-8 rounded-full ${
														level <=
														passwordStrength.strength
															? passwordStrength.color
															: "bg-gray-200"
													}`}
												/>
											))}
										</div>
										<span
											className={`text-xs font-medium text-center sm:text-right ${
												passwordStrength.strength <= 1
													? "text-red-600"
													: passwordStrength.strength ===
													  2
													? "text-yellow-600"
													: passwordStrength.strength ===
													  3
													? "text-blue-600"
													: "text-green-600"
											}`}
										>
											{passwordStrength.text}
										</span>
									</div>
								</div>
							)}
							<p className="text-red-500 text-xs mt-1 h-4">
								{errors.password || "\u00A0"}
							</p>
						</div>
					</div>

					<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						<div>
							<label
								htmlFor="dob"
								className="font-semibold text-xs sm:text-sm pb-1 text-gray-600 block"
							>
								تاريخ الميلاد
							</label>
							<input
								type="date"
								name="dob"
								id="dob"
								value={formData.dob}
								onChange={handleChange}
								className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs mt-1 h-4">
								{errors.dob || "\u00A0"}
							</p>
						</div>

						<div>
							<label
								htmlFor="gender"
								className="font-semibold text-xs sm:text-sm text-gray-600 pb-1 block"
							>
								الجنس/نوع الحساب
							</label>
							<select
								name="gender"
								id="gender"
								value={formData.gender}
								onChange={handleChange}
								className="border rounded-lg px-3 py-2 mt-1 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
								disabled={isLoading}
							>
								<option value="male">ذكَر</option>
								<option value="female">أنثى</option>
								<option value="institute">
									مؤسسة (حساب تجاري)
								</option>
							</select>
						</div>
					</div>

					<div className="flex justify-center items-center mt-4">
						<div className="flex flex-col gap-3 w-full">
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
											جاري التسجيل...
										</span>
									</>
								) : (
									"سجل حسابك"
								)}
							</button>

							<div className="flex items-center space-x-2 rtl:space-x-reverse">
								<div className="h-px flex-1 bg-gray-300" />
								<p className="text-xs sm:text-sm text-gray-500 px-2">
									أو تابع باستخدام
								</p>
								<div className="h-px flex-1 bg-gray-300" />
							</div>

							<button
								type="button"
								onClick={onApple}
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
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M25.565,9.785c-0.123,0.077-3.051,1.702-3.051,5.305c0.138,4.109,3.695,5.55,3.756,5.55 c-0.061,0.077-0.537,1.963-1.947,3.94C23.204,26.283,21.962,28,20.076,28c-1.794,0-2.438-1.135-4.508-1.135 c-2.223,0-2.852,1.135-4.554,1.135c-1.886,0-3.22-1.809-4.4-3.496c-1.533-2.208-2.836-5.673-2.882-9 c-0.031-1.763,0.307-3.496,1.165-4.968c1.211-2.055,3.373-3.45,5.734-3.496c1.809-0.061,3.419,1.242,4.523,1.242 c1.058,0,3.036-1.242,5.274-1.242C21.394,7.041,23.97,7.332,25.565,9.785z M15.001,6.688c-0.322-1.61,0.567-3.22,1.395-4.247 c1.058-1.242,2.729-2.085,4.17-2.085c0.092,1.61-0.491,3.189-1.533,4.339C18.098,5.937,16.488,6.872,15.001,6.688z" />
								</svg>
							</button>

							<button
								type="button"
								onClick={onGoogle}
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
					</div>

					<div className="text-center text-xs sm:text-sm text-muted-foreground mt-3">
						عندك حساب؟{" "}
						<Link href="/login" className="underline font-medium">
							سجل الدخول
						</Link>
					</div>
				</div>
			</form>

			<Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
				<DialogContent className="sm:max-w-md rounded-xl text-center p-4 sm:p-6">
					<DialogHeader className="flex flex-col items-center gap-2">
						<DialogTitle className="text-lg sm:text-xl font-bold text-green-600">
							🎉 تم إنشاء الحساب
						</DialogTitle>
						<DialogDescription className="text-gray-600 text-sm sm:text-base">
							تم إرسال رابط التفعيل إلى بريدك الإلكتروني.
							<br />
							بعد التفعيل، يمكنك تسجيل الدخول.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4 sm:mt-6">
						<button
							onClick={() => {
								setShowConfirmModal(false);
								router.push("/login");
							}}
							className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 sm:py-2.5 rounded-md text-sm sm:text-base"
						>
							الذهاب لتسجيل الدخول
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Form;
