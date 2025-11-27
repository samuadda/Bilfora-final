import Navbar from "@/components/landing-page/Navbar";
import Image from "next/image";
import { TextAnimate } from "@/components/landing-page/text-animate";

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
				<div className="text-center mb-16">
                    <TextAnimate
                        as="h1"
                        animation="blurIn"
                        once={true}
                        className="text-4xl font-bold md:text-5xl text-[#012d46] mb-6"
                    >
                        عن بيلفورا
                    </TextAnimate>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        نحن نسعى لتمكين المستقلين والشركات الصغيرة من خلال أدوات مالية ذكية وبسيطة.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <h2 className="text-2xl font-bold text-[#012d46]">قصتنا</h2>
                        <p>
                            بدأت بيلفورا برؤية بسيطة: لماذا يجب أن يكون إصدار الفواتير معقداً؟ لاحظنا أن العديد من المبدعين وأصحاب الأعمال الصغيرة يقضون وقتاً طويلاً في التعامل مع جداول البيانات المعقدة والبرامج المحاسبية الضخمة التي لا تناسب احتياجاتهم.
                        </p>
                        <p>
                            لذا قمنا ببناء بيلفورا. منصة تركز على البساطة، السرعة، والجمال. نحن نؤمن بأن أدوات عملك يجب أن تكون ممتعة للاستخدام بقدر ما هي مفيدة.
                        </p>
                    </div>
                    <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-2xl">
                         {/* Placeholder image since we don't have a specific team photo */}
                         <div className="absolute inset-0 bg-gradient-to-br from-[#7f2dfb] to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                            بيلفورا
                         </div>
                    </div>
                </div>

                <div className="space-y-6 text-gray-600 leading-relaxed text-center">
                    <h2 className="text-2xl font-bold text-[#012d46]">مهمتنا</h2>
                    <p className="max-w-2xl mx-auto">
                        مهمتنا هي تبسيط الجانب المالي لكل مستقل وصاحب عمل صغير في العالم العربي، ليتفرغوا لما يجيدونه حقاً: الإبداع والنمو.
                    </p>
                </div>
			</main>
		</div>
	);
}

