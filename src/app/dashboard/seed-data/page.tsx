"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SeedDataPage() {
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });

	const seedData = async () => {
		setLoading(true);
		setStatus({ type: null, message: "" });

		try {
			// Get current user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				setStatus({
					type: "error",
					message: "يجب تسجيل الدخول أولاً",
				});
				return;
			}

			const userId = user.id;
			const results: string[] = [];

			// 1. Seed Products
			const products = [
				{
					name: "تصميم شعار احترافي",
					description: "تصميم شعار احترافي مع 3 خيارات للتصميم",
					unit: "خدمة",
					unit_price: 1500.00,
				},
				{
					name: "تصميم موقع إلكتروني",
					description: "تصميم وتطوير موقع إلكتروني متجاوب",
					unit: "مشروع",
					unit_price: 15000.00,
				},
				{
					name: "تصميم هوية بصرية كاملة",
					description: "هوية بصرية شاملة للشركة (شعار، ألوان، خطوط)",
					unit: "حزمة",
					unit_price: 5000.00,
				},
				{
					name: "تصميم منشورات إعلانية",
					description: "تصميم منشورات لوسائل التواصل الاجتماعي",
					unit: "منشور",
					unit_price: 200.00,
				},
				{
					name: "تصميم كتالوج منتجات",
					description: "تصميم كتالوج احترافي للمنتجات",
					unit: "صفحة",
					unit_price: 300.00,
				},
				{
					name: "استشارة تسويقية",
					description: "جلسة استشارة تسويقية لمدة ساعتين",
					unit: "جلسة",
					unit_price: 800.00,
				},
				{
					name: "إدارة حسابات التواصل",
					description: "إدارة شهرية لحسابات التواصل الاجتماعي",
					unit: "شهر",
					unit_price: 2500.00,
				},
				{
					name: "تصوير منتجات",
					description: "جلسة تصوير احترافية للمنتجات",
					unit: "جلسة",
					unit_price: 1200.00,
				},
				{
					name: "تصميم تطبيق جوال",
					description: "تصميم واجهات تطبيق جوال",
					unit: "شاشة",
					unit_price: 500.00,
				},
				{
					name: "خدمة استضافة وصيانة",
					description: "استضافة وصيانة موقع إلكتروني شهرياً",
					unit: "شهر",
					unit_price: 500.00,
				},
			];

			const { data: insertedProducts, error: productsError } = await supabase
				.from("products")
				.insert(
					products.map((p) => ({
						...p,
						user_id: userId,
						active: true,
					}))
				)
				.select();

			if (productsError) throw productsError;
			results.push(`✅ تم إضافة ${insertedProducts?.length || 0} منتج/خدمة`);

			// 2. Seed Clients
			const clients = [
				{
					name: "أحمد محمد العتيبي",
					email: "ahmed.alotaibi@example.com",
					phone: "+966501234567",
					company_name: "شركة العتيبي للتجارة",
					tax_number: "310123456700003",
					address: "طريق الملك فهد، حي العليا",
					city: "الرياض",
					status: "active" as const,
					notes: "عميل مميز - يفضل التواصل عبر الواتساب",
				},
				{
					name: "فاطمة عبدالله السعيد",
					email: "fatima.alsaeed@example.com",
					phone: "+966502345678",
					company_name: null,
					tax_number: null,
					address: "حي النرجس، شارع الأمير سلطان",
					city: "جدة",
					status: "active" as const,
					notes: "مصممة جرافيك - تعمل كمستقلة",
				},
				{
					name: "خالد سعد الدوسري",
					email: "khalid.aldosari@example.com",
					phone: "+966503456789",
					company_name: "مؤسسة الدوسري للمقاولات",
					tax_number: "310234567800004",
					address: "طريق الخليج، حي الصفا",
					city: "الدمام",
					status: "active" as const,
					notes: "مشاريع كبيرة - يفضل الدفع نقداً",
				},
				{
					name: "سارة علي القحطاني",
					email: "sara.alqahtani@example.com",
					phone: "+966504567890",
					company_name: "مكتب سارة للاستشارات",
					tax_number: "310345678900005",
					address: "حي الياسمين",
					city: "الرياض",
					status: "active" as const,
					notes: "تستلم الفواتير شهرياً",
				},
				{
					name: "محمد حسن الحربي",
					email: "mohammed.alharbi@example.com",
					phone: "+966505678901",
					company_name: "شركة الحربي للتكنولوجيا",
					tax_number: "310456789000006",
					address: "طريق الأمير سلطان",
					city: "الرياض",
					status: "active" as const,
					notes: "عميل جديد - يحتاج متابعة",
				},
				{
					name: "نورة عبدالرحمن الزهراني",
					email: "nora.alzahrani@example.com",
					phone: "+966506789012",
					company_name: null,
					tax_number: null,
					address: "حي الروابي",
					city: "الطائف",
					status: "active" as const,
					notes: "مصممة أزياء - تعمل من المنزل",
				},
				{
					name: "عبدالعزيز فهد المطيري",
					email: "abdulaziz.almutairi@example.com",
					phone: "+966507890123",
					company_name: "مؤسسة المطيري للمقاولات",
					tax_number: "310567890100007",
					address: "حي النزهة",
					city: "الخبر",
					status: "active" as const,
					notes: "مشاريع متعددة - عميل دائم",
				},
				{
					name: "ريم خالد الشمري",
					email: "reem.alshammari@example.com",
					phone: "+966508901234",
					company_name: "مكتب ريم للتصميم الداخلي",
					tax_number: "310678901200008",
					address: "طريق الملك عبدالعزيز",
					city: "الرياض",
					status: "active" as const,
					notes: "تصاميم فاخرة - عملاء VIP",
				},
			];

			const { data: insertedClients, error: clientsError } = await supabase
				.from("clients")
				.insert(
					clients.map((c) => ({
						...c,
						user_id: userId,
					}))
				)
				.select();

			if (clientsError) throw clientsError;
			results.push(`✅ تم إضافة ${insertedClients?.length || 0} عميل`);

			// 3. Seed Invoices
			const now = new Date();
			const timestamp = Date.now().toString().slice(-6); // Last 6 digits for uniqueness
			const invoices = [
				{
					client_id: insertedClients[0].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-001`,
					issue_date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "paid" as const,
					subtotal: 15000.0,
					tax_rate: 15.0,
					tax_amount: 2250.0,
					total_amount: 17250.0,
					notes: "تم الدفع بالكامل - شكراً لتعاملكم معنا",
				},
				{
					client_id: insertedClients[0].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-002`,
					issue_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "sent" as const,
					subtotal: 5000.0,
					tax_rate: 15.0,
					tax_amount: 750.0,
					total_amount: 5750.0,
					notes: "في انتظار الدفع",
				},
				{
					client_id: insertedClients[1].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-003`,
					issue_date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "overdue" as const,
					subtotal: 2400.0,
					tax_rate: 15.0,
					tax_amount: 360.0,
					total_amount: 2760.0,
					notes: "فاتورة متأخرة - يرجى التواصل مع العميل",
				},
				{
					client_id: insertedClients[2].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-004`,
					issue_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "sent" as const,
					subtotal: 18000.0,
					tax_rate: 15.0,
					tax_amount: 2700.0,
					total_amount: 20700.0,
					notes: null,
				},
				{
					client_id: insertedClients[3].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-005`,
					issue_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "draft" as const,
					subtotal: 3200.0,
					tax_rate: 15.0,
					tax_amount: 480.0,
					total_amount: 3680.0,
					notes: "مسودة - قيد المراجعة",
				},
				{
					client_id: insertedClients[4].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-006`,
					issue_date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "paid" as const,
					subtotal: 7500.0,
					tax_rate: 15.0,
					tax_amount: 1125.0,
					total_amount: 8625.0,
					notes: "تم الدفع - شكراً",
				},
				{
					client_id: insertedClients[5].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-007`,
					issue_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "sent" as const,
					subtotal: 1500.0,
					tax_rate: 15.0,
					tax_amount: 225.0,
					total_amount: 1725.0,
					notes: null,
				},
				{
					client_id: insertedClients[6].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-008`,
					issue_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "draft" as const,
					subtotal: 12000.0,
					tax_rate: 15.0,
					tax_amount: 1800.0,
					total_amount: 13800.0,
					notes: "مشروع كبير - قيد الإعداد",
				},
				{
					client_id: insertedClients[7].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-009`,
					issue_date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "paid" as const,
					subtotal: 5000.0,
					tax_rate: 15.0,
					tax_amount: 750.0,
					total_amount: 5750.0,
					notes: "تم الدفع - عميل مميز",
				},
				{
					client_id: insertedClients[1].id,
					invoice_number: `INV-${now.getFullYear()}-${timestamp}-010`,
					issue_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					due_date: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000)
						.toISOString()
						.split("T")[0],
					status: "sent" as const,
					subtotal: 4000.0,
					tax_rate: 15.0,
					tax_amount: 600.0,
					total_amount: 4600.0,
					notes: "فاتورة شهرية",
				},
			];

			const { data: insertedInvoices, error: invoicesError } = await supabase
				.from("invoices")
				.insert(
					invoices.map((inv) => ({
						...inv,
						user_id: userId,
					}))
				)
				.select();

			if (invoicesError) throw invoicesError;
			results.push(`✅ تم إضافة ${insertedInvoices?.length || 0} فاتورة`);

			// 4. Seed Invoice Items
			const invoiceItems = [
				// Invoice 1 items
				{
					invoice_id: insertedInvoices[0].id,
					description: "تصميم موقع إلكتروني",
					quantity: 1,
					unit_price: 15000.0,
					total: 15000.0,
				},
				// Invoice 2 items
				{
					invoice_id: insertedInvoices[1].id,
					description: "تصميم هوية بصرية كاملة",
					quantity: 1,
					unit_price: 5000.0,
					total: 5000.0,
				},
				// Invoice 3 items
				{
					invoice_id: insertedInvoices[2].id,
					description: "تصميم منشورات إعلانية",
					quantity: 12,
					unit_price: 200.0,
					total: 2400.0,
				},
				// Invoice 4 items
				{
					invoice_id: insertedInvoices[3].id,
					description: "تصميم موقع إلكتروني",
					quantity: 1,
					unit_price: 15000.0,
					total: 15000.0,
				},
				{
					invoice_id: insertedInvoices[3].id,
					description: "تصميم شعار احترافي",
					quantity: 1,
					unit_price: 1500.0,
					total: 1500.0,
				},
				{
					invoice_id: insertedInvoices[3].id,
					description: "تصميم منشورات إعلانية",
					quantity: 10,
					unit_price: 200.0,
					total: 2000.0,
				},
				// Invoice 5 items
				{
					invoice_id: insertedInvoices[4].id,
					description: "استشارة تسويقية",
					quantity: 4,
					unit_price: 800.0,
					total: 3200.0,
				},
				// Invoice 6 items
				{
					invoice_id: insertedInvoices[5].id,
					description: "تصميم شعار احترافي",
					quantity: 1,
					unit_price: 1500.0,
					total: 1500.0,
				},
				{
					invoice_id: insertedInvoices[5].id,
					description: "تصميم هوية بصرية كاملة",
					quantity: 1,
					unit_price: 5000.0,
					total: 5000.0,
				},
				{
					invoice_id: insertedInvoices[5].id,
					description: "تصميم منشورات إعلانية",
					quantity: 5,
					unit_price: 200.0,
					total: 1000.0,
				},
				// Invoice 7 items
				{
					invoice_id: insertedInvoices[6].id,
					description: "تصميم شعار احترافي",
					quantity: 1,
					unit_price: 1500.0,
					total: 1500.0,
				},
				// Invoice 8 items
				{
					invoice_id: insertedInvoices[7].id,
					description: "تصميم موقع إلكتروني",
					quantity: 1,
					unit_price: 15000.0,
					total: 15000.0,
				},
				{
					invoice_id: insertedInvoices[7].id,
					description: "تصميم منشورات إعلانية",
					quantity: 15,
					unit_price: 200.0,
					total: 3000.0,
				},
				// Invoice 9 items
				{
					invoice_id: insertedInvoices[8].id,
					description: "تصميم هوية بصرية كاملة",
					quantity: 1,
					unit_price: 5000.0,
					total: 5000.0,
				},
				// Invoice 10 items
				{
					invoice_id: insertedInvoices[9].id,
					description: "إدارة حسابات التواصل",
					quantity: 1,
					unit_price: 2500.0,
					total: 2500.0,
				},
				{
					invoice_id: insertedInvoices[9].id,
					description: "تصميم منشورات إعلانية",
					quantity: 5,
					unit_price: 200.0,
					total: 1000.0,
				},
				{
					invoice_id: insertedInvoices[9].id,
					description: "استشارة تسويقية",
					quantity: 1,
					unit_price: 800.0,
					total: 800.0,
				},
			];

			const { error: itemsError } = await supabase
				.from("invoice_items")
				.insert(invoiceItems);

			if (itemsError) throw itemsError;
			results.push(
				`✅ تم إضافة ${invoiceItems.length} عنصر فاتورة`
			);

			setStatus({
				type: "success",
				message: results.join("\n"),
			});
		} catch (error: any) {
			console.error("Error seeding data:", error);
			setStatus({
				type: "error",
				message: error.message || "حدث خطأ أثناء إضافة البيانات",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-2xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-2xl shadow-lg p-8"
				>
					<h1 className="text-3xl font-bold text-[#012d46] mb-4">
						إضافة بيانات تجريبية
					</h1>
					<p className="text-gray-600 mb-6">
						سيتم إضافة بيانات حقيقية إلى قاعدة البيانات:
					</p>
					<ul className="list-disc list-inside text-gray-700 mb-8 space-y-2">
						<li>10 منتجات/خدمات</li>
						<li>8 عملاء</li>
						<li>10 فواتير بحالات مختلفة (مدفوعة، مرسلة، متأخرة، مسودة)</li>
						<li>17 عنصر فاتورة</li>
					</ul>

					<button
						onClick={seedData}
						disabled={loading}
						className="w-full px-6 py-3 bg-[#7f2dfb] text-white rounded-xl font-semibold hover:bg-[#6a1fd8] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{loading ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" />
								جاري الإضافة...
							</>
						) : (
							"إضافة البيانات"
						)}
					</button>

					{status.type && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className={`mt-6 p-4 rounded-xl ${
								status.type === "success"
									? "bg-green-50 border border-green-200"
									: "bg-red-50 border border-red-200"
							}`}
						>
							<div className="flex items-start gap-3">
								{status.type === "success" ? (
									<CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
								) : (
									<AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
								)}
								<div className="flex-1">
									<p
										className={`font-medium ${
											status.type === "success"
												? "text-green-800"
												: "text-red-800"
										}`}
									>
										{status.message.split("\n").map((line, i) => (
											<span key={i}>
												{line}
												<br />
											</span>
										))}
									</p>
								</div>
							</div>
						</motion.div>
					)}
				</motion.div>
			</div>
		</div>
	);
}

