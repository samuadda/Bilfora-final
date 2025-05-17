"use client";

import Link from "next/link";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

const Form = () => {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        username: "",
        password: "",
        dob: "",
        gender: "male",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const calculateAge = dob => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!formData.fullname.trim()) {
            newErrors.fullname = "الاسم الكامل مطلوب";
        }

        if (!formData.email.trim()) {
            newErrors.email = "البريد الإلكتروني مطلوب";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "البريد الإلكتروني غير صالح";
        }

        if (!formData.username.trim()) {
            newErrors.username = "اسم المستخدم مطلوب";
        } else if (formData.username.length < 3) {
            newErrors.username = "اسم المستخدم يجب أن يكون 3 أحرف أو أكثر";
        } else if (!usernameRegex.test(formData.username)) {
            newErrors.username = "اسم المستخدم يجب أن يكون بالإنجليزية وبدون مسافات";
        }

        if (!formData.password) {
            newErrors.password = "كلمة المرور مطلوبة";
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = "كلمة المرور يجب أن تكون 8 خانات على الأقل، وتحتوي على حرف واحد ورقم واحد على الأقل";
        }

        if (!formData.dob) {
            newErrors.dob = "تاريخ الميلاد مطلوب";
        } else {
            const age = calculateAge(formData.dob);
            if (age < 13) {
                newErrors.dob = "يجب أن يكون عمرك 13 سنة أو أكثر";
            }
        }

        return newErrors;
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        console.log("Form Submitted:", formData);
        // TODO: Send data to backend
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-t from-[#cc15ff3d] to-[#fff]">
            <DotPattern width={16} height={16} glow={true} className={cn("[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]")} />
            <form onSubmit={handleSubmit} className="relative px-4 py-10 mx-8 md:mx-0 shadow rounded-3xl sm:p-10 bg-white">
                <div className="max-w-md mx-auto">
                    <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                        <Image src="/logo-ar-navy.svg" alt="logo" width={80} height={80} priority />
                    </h1>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullname" className="font-semibold text-sm text-gray-600 pb-1 block">
                                الاسم الكامل
                            </label>
                            <input
                                type="text"
                                id="fullname"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
                            />
                            <p className="text-red-500 text-xs mt-1 h-4">{errors.fullname || "\u00A0"}</p>
                        </div>
                        <div>
                            <label htmlFor="email" className="font-semibold text-sm text-gray-600 pb-1 block">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
                            />
                            <p className="text-red-500 text-xs mt-1 h-4">{errors.email || "\u00A0"}</p>
                        </div>
                        <div>
                            <label htmlFor="username" className="font-semibold text-sm pb-1 block text-gray-600">
                                اسم المستخدم
                            </label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
                            />
                            <p className="text-red-500 text-xs mt-1 h-4">{errors.username || "\u00A0"}</p>
                        </div>
                        <div>
                            <label htmlFor="password" className="font-semibold text-sm text-gray-600 pb-1 block">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="border rounded-lg px-3 py-2 mt-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300 pr-10"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-500">
                                    {showPassword ? "إخفاء" : "إظهار"}
                                </button>
                            </div>
                            <p className="text-red-500 text-xs mt-1 h-4">{errors.password || "\u00A0"}</p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="dob" className="font-semibold text-sm pb-1 text-gray-600 block">
                                تاريخ الميلاد
                            </label>
                            <input
                                type="date"
                                name="dob"
                                id="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
                            />
                            <p className="text-red-500 text-xs mt-1 h-4">{errors.dob || "\u00A0"}</p>
                        </div>
                        <div>
                            <label htmlFor="gender" className="font-semibold text-sm text-gray-600 pb-1 block">
                                الجنس
                            </label>
                            <select
                                name="gender"
                                id="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="border rounded-lg px-3 py-2 mt-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-300"
                            >
                                <option value="male">ذكَر</option>
                                <option value="female">أنثى</option>
                                <option value="inistitute">مؤسسة</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center items-center">
                        <div className="flex flex-col gap-4 w-full">
                            <button type="submit" className="w-full bg-[#7f2dfb] text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-violet-400 transition duration-100">
                                سجل حسابك
                            </button>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <div className="h-px flex-1 bg-gray-300" />
                                <p className="text-sm text-gray-500">أو تابع باستخدام</p>
                                <div className="h-px flex-1 bg-gray-300" />
                            </div>

                            <button type="button" className="flex items-center justify-center gap-2 w-full border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 transition duration-300">
                                الدخول عبر آبل
                            </button>

                            <button type="button" className="flex items-center justify-center gap-2 w-full border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 transition duration-300">
                                الدخول عبر جوجل
                            </button>
                        </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-4">
                        عندك حساب؟{" "}
                        <Link href="/login" className="underline font-medium">
                            سجل الدخول
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Form;
