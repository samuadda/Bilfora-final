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
                                <svg viewBox="0 0 30 30" height={20} width={20} y="0px" x="0px" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25.565,9.785c-0.123,0.077-3.051,1.702-3.051,5.305c0.138,4.109,3.695,5.55,3.756,5.55 c-0.061,0.077-0.537,1.963-1.947,3.94C23.204,26.283,21.962,28,20.076,28c-1.794,0-2.438-1.135-4.508-1.135 c-2.223,0-2.852,1.135-4.554,1.135c-1.886,0-3.22-1.809-4.4-3.496c-1.533-2.208-2.836-5.673-2.882-9 c-0.031-1.763,0.307-3.496,1.165-4.968c1.211-2.055,3.373-3.45,5.734-3.496c1.809-0.061,3.419,1.242,4.523,1.242 c1.058,0,3.036-1.242,5.274-1.242C21.394,7.041,23.97,7.332,25.565,9.785z M15.001,6.688c-0.322-1.61,0.567-3.22,1.395-4.247 c1.058-1.242,2.729-2.085,4.17-2.085c0.092,1.61-0.491,3.189-1.533,4.339C18.098,5.937,16.488,6.872,15.001,6.688z" />
                                </svg>
                            </button>

                            <button type="button" className="flex items-center justify-center gap-2 w-full border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 transition duration-300">
                                الدخول عبر جوجل
                                <svg viewBox="0 0 24 24" height={20} width={20} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5c1.62 0 3.1.55 4.29 1.47l3.64-3.47C17.81 1.14 15.04 0 12 0 7.39 0 3.4 2.6 1.39 6.41l4.04 3.19C6.41 6.92 8.98 5 12 5z" fill="#F44336" />
                                    <path d="M23.9 13.5c.06-.49.1-.99.1-1.5 0-.86-.09-1.69-.26-2.5H12v5h6.49c-.52 1.36-1.46 2.52-2.65 3.32l4.06 3.2c2.17-2.39 3.64-5.03 4-7.99z" fill="#2196F3" />
                                    <path d="M5 12c0-.84.16-1.65.43-2.4L1.39 6.41C.5 8.08 0 9.98 0 12c0 2 0.5 3.88 1.36 5.53l4.05-3.2C5.15 13.6 5 12.82 5 12z" fill="#FFC107" />
                                    <path d="M12 19c-3.05 0-5.63-1.95-6.59-4.66L1.36 17.53C3.36 21.37 7.37 24 12 24c3.03 0 5.79-1.12 7.9-2.98l-4.06-3.2C14.74 18.56 13.43 19 12 19z" fill="#00B060" />
                                </svg>
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
