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

			const { error } = await supabase.auth.signUp({
				email: formData.email,
				password: formData.password,
				options: {
					emailRedirectTo: `${location.origin}/confirmed`,
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
				if (
					(error as { code?: string }).code ===
					"user_already_registered"
				) {
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
		} catch (err: unknown) {
			console.error("Unexpected Error:", err);
			setGeneralError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
		} finally {
			setIsLoading(false);
		}
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
