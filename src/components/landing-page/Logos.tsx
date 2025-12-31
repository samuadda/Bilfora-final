"use client";

export function Logos() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-gray-500 mb-8">
          يثق بنا أكثر من <span className="text-[#7f2dfb] font-bold">500+ مستقل وشركة سعودية</span>
        </h2>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="text-center px-6 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <p className="text-2xl font-bold text-gray-700">مصممين</p>
            <p className="text-sm text-gray-500">جرافيك • UI/UX</p>
          </div>
          <div className="text-center px-6 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <p className="text-2xl font-bold text-gray-700">مطورين</p>
            <p className="text-sm text-gray-500">ويب • تطبيقات</p>
          </div>
          <div className="text-center px-6 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <p className="text-2xl font-bold text-gray-700">مستشارين</p>
            <p className="text-sm text-gray-500">إدارة • تسويق</p>
          </div>
          <div className="text-center px-6 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <p className="text-2xl font-bold text-gray-700">محاسبين</p>
            <p className="text-sm text-gray-500">مستقلين</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          من الرياض إلى جدة - في كل أنحاء المملكة
        </p>
      </div>
    </section>
  );
}

