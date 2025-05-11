"use client";

import Link from "next/link";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

const Form = () => {
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-t from-[#cc15ff3d] to-[#fff]">
            <DotPattern width={16} height={16} glow={true} className={cn("[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]")} />
            <div className="relative px-4 py-10 mx-8 md:mx-0 shadow rounded-3xl sm:p-10 bg-white">
                <div className="max-w-md mx-auto">
                    <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                        <Image src="/logo-ar-navy.svg" alt="logo" width={80} height={80} priority />
                    </h1>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-sm text-gray-600 pb-1 block" htmlFor="fullname">
                                الاسم الكامل
                            </label>
                            <input
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                type="text"
                                id="fullname"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-sm text-gray-600 pb-1 block" htmlFor="email">
                                البريد الإلكتروني
                            </label>
                            <input
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                type="email"
                                id="email"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-sm text-gray-600 pb-1 block" htmlFor="username">
                                اسم المستخدم
                            </label>
                            <input
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                type="text"
                                id="username"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-sm text-gray-600 pb-1 block" htmlFor="password">
                                كلمة المرور
                            </label>
                            <input
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                type="password"
                                id="password"
                            />
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="font-semibold text-sm text-gray-600 pb-1 block" htmlFor="dob">
                                تاريخ الميلاد
                            </label>
                            <input
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                type="date"
                                id="dob"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-sm text-gray-600 pb-1 block" htmlFor="gender">
                                الجنس
                            </label>
                            <select className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500" id="gender">
                                <option value="male">ذكَر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-center items-center">
                        <div>
                            <button className="flex items-center justify-center gap-2 w-full border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 transition duration-300" type="button">
                                الدخول عبر آبل
                                <svg viewBox="0 0 30 30" height={20} width={20} y="0px" x="0px" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25.565,9.785c-0.123,0.077-3.051,1.702-3.051,5.305c0.138,4.109,3.695,5.55,3.756,5.55 c-0.061,0.077-0.537,1.963-1.947,3.94C23.204,26.283,21.962,28,20.076,28c-1.794,0-2.438-1.135-4.508-1.135 c-2.223,0-2.852,1.135-4.554,1.135c-1.886,0-3.22-1.809-4.4-3.496c-1.533-2.208-2.836-5.673-2.882-9 c-0.031-1.763,0.307-3.496,1.165-4.968c1.211-2.055,3.373-3.45,5.734-3.496c1.809-0.061,3.419,1.242,4.523,1.242 c1.058,0,3.036-1.242,5.274-1.242C21.394,7.041,23.97,7.332,25.565,9.785z M15.001,6.688c-0.322-1.61,0.567-3.22,1.395-4.247 c1.058-1.242,2.729-2.085,4.17-2.085c0.092,1.61-0.491,3.189-1.533,4.339C18.098,5.937,16.488,6.872,15.001,6.688z" />
                                </svg>
                            </button>
                            <button className="flex items-center justify-center gap-2 w-full border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 transition duration-300" type="button">
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
                    <div className="mt-5">
                        <button type="submit" className="w-full bg-[#7f2dfb] text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-violet-400 transition duration-100 cursor-pointer">
                            سجل حسابك
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-center text-sm text-muted-foreground">
                        <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
                        عندك حساب؟
                        <Link href="/register" className="underline font-semibold text-black">
                            سجل دخول
                        </Link>
                        <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Form;
