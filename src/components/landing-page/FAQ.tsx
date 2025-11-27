"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "هل بيلفورا مجاني؟",
    answer:
      "نعم، توجد خطة مجانية تتيح لك إنشاء عدد محدد من الفواتير شهرياً، وهي مثالية للمستقلين في بداية مشوارهم.",
  },
  {
    question: "هل الفواتير معتمدة من هيئة الزكاة والضريبة؟",
    answer:
      "نعم، جميع الفواتير الصادرة من بيلفورا متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك في المملكة العربية السعودية (فاتورة إلكترونية).",
  },
  {
    question: "هل يمكنني تخصيص شكل الفاتورة؟",
    answer:
      "بالتأكيد! يمكنك إضافة شعارك، تغيير الألوان، وتعديل بعض النصوص لتناسب هوية علامتك التجارية.",
  },
  {
    question: "كيف يمكنني استلام أموالي؟",
    answer:
      "حالياً، بيلفورا يساعدك في إصدار الفاتورة وإرسالها للعميل. الدفع يتم بينك وبين العميل مباشرة عبر وسائل الدفع التي تحددها في الفاتورة (تحويل بنكي، STC Pay، إلخ).",
  },
  {
    question: "هل بياناتي آمنة؟",
    answer:
      "نحن نأخذ أمان بياناتك بجدية تامة. جميع البيانات مشفرة ومحفوظة في خوادم آمنة مع نسخ احتياطية دورية.",
  },
];

const AccordionItem = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex w-full items-center justify-between py-6 text-right text-lg font-medium transition-colors hover:text-[#7f2dfb]"
        onClick={onClick}
      >
        <span>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-600 leading-relaxed">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl px-4 py-24 sm:py-32" id="faq">
      <div className="text-center mb-16">
        <TextAnimate
          as="h2"
          animation="blurIn"
          once={true}
          className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
        >
          الأسئلة الشائعة
        </TextAnimate>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          إجابات على الأسئلة التي قد تدور في ذهنك
        </p>
      </div>

      <div className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}
