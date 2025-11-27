"use client";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import MainButton from "@/components/MainButton";
import Link from "next/link";

const tiers = [
  {
    name: "مجاني",
    id: "free",
    href: "/register",
    price: { monthly: "0", annually: "0" },
    description: "كل ما تحتاجه للبدء في إصدار الفواتير.",
    features: [
      "عدد غير محدود من العملاء",
      "5 فواتير شهرياً",
      "قوالب فواتير أساسية",
      "تصدير PDF",
      "لوحة تحكم بسيطة",
    ],
    mostPopular: false,
  },
  {
    name: "احترافي",
    id: "pro",
    href: "/register?plan=pro",
    price: { monthly: "29", annually: "290" },
    description: "للمستقلين والشركات الصغيرة التي تنمو بسرعة.",
    features: [
      "فواتير غير محدودة",
      "قوالب احترافية مخصصة",
      "إزالة شعار بيلفورا",
      "تعدد العملات",
      "تقارير متقدمة",
      "دعم فني ذو أولوية",
    ],
    mostPopular: true,
  },
  {
    name: "مؤسسات",
    id: "enterprise",
    href: "/contact",
    price: { monthly: "99", annually: "990" },
    description: "حلول مخصصة للشركات الكبيرة والفرق.",
    features: [
      "كل مميزات الباقة الاحترافية",
      "وصول متعدد للمستخدمين (قريباً)",
      "ربط API (قريباً)",
      "مدير حساب مخصص",
      "تخصيص كامل للهوية",
    ],
    mostPopular: false,
  },
];

export function Pricing() {
  return (
    <div className="py-24 sm:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-[#7f2dfb]">
            الأسعار
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            اختر الخطة المناسبة لعملك
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          أسعار بسيطة وشفافة. ابدأ مجانًا وقم بالترقية عندما تحتاج إلى المزيد.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: tierIdx * 0.1 }}
              className={cn(
                tier.mostPopular ? "ring-2 ring-[#7f2dfb]" : "ring-1 ring-gray-200",
                "rounded-3xl p-8 xl:p-10 bg-white relative hover:shadow-xl transition-shadow duration-300"
              )}
            >
              {tier.mostPopular ? (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-sm font-semibold text-white bg-[#7f2dfb] rounded-full">
                  الأكثر شعبية
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.id}
                  className={cn(
                    tier.mostPopular ? "text-[#7f2dfb]" : "text-gray-900",
                    "text-lg font-semibold leading-8"
                  )}
                >
                  {tier.name}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {tier.price.monthly}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  ريال / شهرياً
                </span>
              </p>
              <Link
                href={tier.href}
                aria-describedby={tier.id}
              >
                <button
                    className={cn(
                        tier.mostPopular
                        ? "bg-[#7f2dfb] text-white shadow-sm hover:bg-[#6a1fd8]"
                        : "text-[#7f2dfb] ring-1 ring-inset ring-[#7f2dfb] hover:ring-[#6a1fd8] hover:bg-[#7f2dfb]/5",
                        "mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7f2dfb] transition-all"
                    )}
                >
                    {tier.id === 'free' ? 'ابدأ مجانًا' : 'اشترك الآن'}
                </button>
              </Link>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className="h-6 w-5 flex-none text-[#7f2dfb]"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

