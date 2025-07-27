'use client';

export default function FAQPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-pink-200">
            <div className="bg-white bg-opacity-80 rounded-xl shadow-lg p-10 flex flex-col items-center">
                <h1 className="text-4xl font-extrabold text-purple-700 mb-4 drop-shadow-lg">
                    ❓ صفحة الأسئلة الشائعة تحت الإنشاء ❓
                </h1>
                <p className="text-xl text-pink-600 font-semibold text-center mb-2">
                    نعمل على جمع أهم الأسئلة وإجاباتها لكم بطريقة وردية وبنفسجية!
                </p>
                <p className="text-lg text-purple-500 text-center">
                    شكرًا لصبركم وفضولكم. قريبًا ستجدون كل الإجابات التي تبحثون عنها هنا!
                </p>
            </div>
        </div>
    );
}