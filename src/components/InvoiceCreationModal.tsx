"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Trash2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
    Client,
    CreateInvoiceInput,
    CreateInvoiceItemInput,
    Product,
} from "@/types/database";

interface InvoiceCreationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: (id?: string) => void;
}

export default function InvoiceCreationModal({
	isOpen,
	onClose,
	onSuccess,
}: InvoiceCreationModalProps) {
	// Validation schemas
	const itemSchema = z.object({
		description: z.string().min(1, "الوصف مطلوب"),
		quantity: z.coerce.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
		unit_price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
	});

	const invoiceSchema = z.object({
		client_id: z.string().uuid("العميل غير صالح"),
		order_id: z.string().uuid().optional().or(z.literal("")),
		issue_date: z.string().min(1, "تاريخ الإصدار مطلوب"),
		due_date: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
		status: z.enum(["draft", "sent", "paid", "cancelled"]),
		tax_rate: z.coerce.number().min(0).max(100),
		notes: z.string().optional(),
		items: z.array(itemSchema).min(1, "يجب إضافة عنصر واحد على الأقل"),
	});
	// Modal state
	const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
	const [saving, setSaving] = useState(false);
	const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
	const [newCustomerData, setNewCustomerData] = useState({
		name: "",
		email: "",
		phone: "",
		company_name: "",
	});
	const [invoiceFormData, setInvoiceFormData] = useState<CreateInvoiceInput>({
		client_id: "",
		order_id: "",
		issue_date: new Date().toISOString().split("T")[0],
		due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split("T")[0],
		status: "draft",
		tax_rate: 15,
		notes: "",
		items: [
			{
				description: "",
				quantity: 1,
				unit_price: 0,
			},
		],
	});
	const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const generateInvoiceNumber = () => {
        const year = new Date().getFullYear();
        const unique = Date.now().toString().slice(-6);
        return `INV-${year}-${unique}`;
    };

	// Totals helpers
	const calcSubtotal = () =>
		invoiceFormData.items.reduce(
			(sum, it) =>
				sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
			0
		);
	const calcVat = (subtotal: number) =>
		subtotal * (Number(invoiceFormData.tax_rate || 0) / 100);
	const calcTotal = (subtotal: number, vat: number) => subtotal + vat;

	const closeModal = useCallback(() => {
		resetInvoiceForm();
		onClose();
	}, [onClose]);

	// Load data when modal opens
	useEffect(() => {
		if (isOpen) {
			loadClientsForInvoice();
            loadProducts();
		}
	}, [isOpen]);

	// Handle ESC key and backdrop click
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				closeModal();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, closeModal]);

	const loadClientsForInvoice = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("clients")
				.select("*")
				.eq("user_id", user.id)
				.eq("status", "active")
				.order("name");

			if (error) {
				console.error("Error loading clients:", error);
				return;
			}

			setClients(data || []);
		} catch (err) {
			console.error("Error loading clients:", err);
		}
	};

    const loadProducts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("user_id", user.id)
                .eq("active", true)
                .order("name");

            if (error) {
                console.error("Error loading products:", error);
                return;
            }

            setProducts(data || []);
        } catch (err) {
            console.error("Error loading products:", err);
        }
    };

	const handleInvoiceInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setInvoiceFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleInvoiceItemChange = (
		index: number,
		field: keyof CreateInvoiceItemInput,
		value: string | number
	) => {
		setInvoiceFormData((prev) => ({
			...prev,
			items: prev.items.map((item, i) =>
				i === index ? { ...item, [field]: value } : item
			),
		}));
	};

	const addInvoiceItem = () => {
		setInvoiceFormData((prev) => ({
			...prev,
			items: [
				...prev.items,
				{
					description: "",
					quantity: 1,
					unit_price: 0,
				},
			],
		}));
	};

	const removeInvoiceItem = (index: number) => {
		if (invoiceFormData.items.length > 1) {
			setInvoiceFormData((prev) => ({
				...prev,
				items: prev.items.filter((_, i) => i !== index),
			}));
		}
	};

	const resetInvoiceForm = () => {
		setInvoiceFormData({
			client_id: "",
			order_id: "",
			issue_date: new Date().toISOString().split("T")[0],
			due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0],
			status: "draft",
			tax_rate: 15,
			notes: "",
			items: [
				{
					description: "",
					quantity: 1,
					unit_price: 0,
				},
			],
		});
		setNewCustomerData({
			name: "",
			email: "",
			phone: "",
			company_name: "",
		});
		setShowNewCustomerForm(false);
		setError(null);
	};

	const handleInvoiceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSaving(true);
			setError(null);

			const parsed = invoiceSchema.safeParse(invoiceFormData);
			if (!parsed.success) {
                const msg = parsed.error.issues[0]?.message || "البيانات غير صالحة";
                toast({ title: "تحقق من المدخلات", description: msg, variant: "destructive" });
				return;
			}

			const {
				data: { user },
			} = await supabase.auth.getUser();
            if (!user) {
                toast({ title: "غير مسجل", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
				return;
			}

			// Create invoice
            const { data: invoiceData, error: invoiceError } = await supabase
				.from("invoices")
				.insert({
					user_id: user.id,
					client_id: invoiceFormData.client_id,
                    order_id: null, // no orders usage
                    issue_date: invoiceFormData.issue_date, // YYYY-MM-DD
                    due_date: invoiceFormData.due_date, // YYYY-MM-DD
                    status: invoiceFormData.status,
                    tax_rate: Number(invoiceFormData.tax_rate) || 0,
                    invoice_number: generateInvoiceNumber(),
					notes: invoiceFormData.notes,
				})
                .select("id")
				.single();

			if (invoiceError) {
                console.error("Error creating invoice:", invoiceError);
                // Show detailed DB message if available
                // @ts-ignore
                const msg = invoiceError?.message || invoiceError?.details || "فشل في إنشاء الفاتورة";
                toast({ title: "خطأ", description: msg, variant: "destructive" });
				return;
			}

            // Create invoice items (total is required by schema)
            const itemsToInsert = invoiceFormData.items.map((item) => {
                const quantity = Number(item.quantity) || 0;
                const unit_price = Number(item.unit_price) || 0;
                const total = Number((quantity * unit_price).toFixed(2));
                return {
                    invoice_id: invoiceData.id,
                    description: item.description,
                    quantity,
                    unit_price,
                    total,
                };
            });

            const { error: itemsError } = await supabase
				.from("invoice_items")
				.insert(itemsToInsert);

            if (itemsError) {
                console.error("Error creating invoice items:", itemsError);
                toast({ title: "خطأ", description: itemsError.message || "فشل في إنشاء عناصر الفاتورة", variant: "destructive" });
				return;
			}

			// Update totals (in case trigger latency)
            try {
				await supabase.rpc("recalc_invoice_totals", {
					inv_id: invoiceData.id,
				});
			} catch {}

            toast({ title: "تم إنشاء الفاتورة", description: "تم إنشاء الفاتورة بنجاح" });
			closeModal();
			if (onSuccess) {
				onSuccess(invoiceData.id);
			}
		} catch (err) {
            console.error("Unexpected error:", err);
            toast({ title: "خطأ غير متوقع", description: "حدث خطأ غير متوقع", variant: "destructive" });
		} finally {
			setSaving(false);
		}
	};

	// New customer functions
	const toggleNewCustomerForm = () => {
		setShowNewCustomerForm(!showNewCustomerForm);
		if (showNewCustomerForm) {
			// Reset new customer form when hiding
			setNewCustomerData({
				name: "",
				email: "",
				phone: "",
				company_name: "",
			});
		}
	};

	const handleNewCustomerChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;
		setNewCustomerData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCreateNewCustomer = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			// Validate required fields
			if (!newCustomerData.name || !newCustomerData.email) {
				setError("الاسم والبريد الإلكتروني مطلوبان");
				return;
			}

			// Create new customer
			const { data: customerData, error: customerError } = await supabase
				.from("clients")
				.insert({
					user_id: user.id,
					name: newCustomerData.name,
					email: newCustomerData.email,
					phone: newCustomerData.phone || null,
					company_name: newCustomerData.company_name || null,
					status: "active",
				})
				.select()
				.single();

			if (customerError) {
				console.error("Error creating customer:", customerError);
				setError("فشل في إنشاء العميل");
				return;
			}

			// Add new customer to clients list and select it
			setClients((prev) => [...prev, customerData]);
			setInvoiceFormData((prev) => ({
				...prev,
				client_id: customerData.id,
			}));

			// Hide new customer form and reset
			setShowNewCustomerForm(false);
			setNewCustomerData({
				name: "",
				email: "",
				phone: "",
				company_name: "",
			});
		} catch (err) {
			console.error("Unexpected error creating customer:", err);
			setError("حدث خطأ غير متوقع");
		}
	};

	// closeModal moved above and memoized

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("ar-SA", {
			style: "currency",
			currency: "SAR",
		}).format(amount);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center p-4 z-50"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					closeModal();
				}
			}}
		>
			<div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
				{/* Fixed Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold text-right">
						إنشاء فاتورة جديدة
					</h2>
					<button
						onClick={closeModal}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{/* Error Display */}
				{error && (
					<div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
						<AlertCircle size={16} className="text-red-600" />
						<span className="text-red-700 text-sm">{error}</span>
					</div>
				)}

				{/* Scrollable Body */}
				<div className="flex-1 overflow-y-auto p-6">
					<form onSubmit={handleInvoiceSubmit} className="space-y-6">
						{/* Customer Selection */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<label className="block text-sm font-medium text-gray-700 text-right">
									العميل *
								</label>
								<button
									type="button"
									onClick={toggleNewCustomerForm}
									className="text-purple-600 hover:text-purple-700 text-sm font-medium"
								>
									{showNewCustomerForm
										? "اختيار عميل موجود"
										: "إضافة عميل جديد"}
								</button>
							</div>

							{!showNewCustomerForm ? (
								<select
									name="client_id"
									value={invoiceFormData.client_id}
									onChange={handleInvoiceInputChange}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									required
								>
									<option value="">اختر العميل</option>
									{clients.map((client) => (
										<option
											key={client.id}
											value={client.id}
										>
											{client.name} - {client.email}
										</option>
									))}
								</select>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
									<div>
										<label className="block text-sm text-gray-600 mb-1 text-right">
											اسم العميل *
										</label>
										<input
											name="name"
											value={newCustomerData.name}
											onChange={handleNewCustomerChange}
											className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-600 mb-1 text-right">
											البريد الإلكتروني *
										</label>
										<input
											name="email"
											type="email"
											value={newCustomerData.email}
											onChange={handleNewCustomerChange}
											className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
											required
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-600 mb-1 text-right">
											رقم الهاتف
										</label>
										<input
											name="phone"
											value={newCustomerData.phone}
											onChange={handleNewCustomerChange}
											className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-600 mb-1 text-right">
											اسم الشركة
										</label>
										<input
											name="company_name"
											value={newCustomerData.company_name}
											onChange={handleNewCustomerChange}
											className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
										/>
									</div>
									<div className="md:col-span-2 flex justify-end">
										<button
											type="button"
											onClick={handleCreateNewCustomer}
											className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700"
										>
											إنشاء العميل
										</button>
									</div>
								</div>
							)}
						</div>

						{/* Invoice Details */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Removed order selection; replaced with products on item rows */}
							<div>
								<label className="block text-sm text-gray-600 mb-1 text-right">
									تاريخ الإصدار *
								</label>
								<input
									name="issue_date"
									type="date"
									value={invoiceFormData.issue_date}
									onChange={handleInvoiceInputChange}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									required
								/>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1 text-right">
									تاريخ الاستحقاق *
								</label>
								<input
									name="due_date"
									type="date"
									value={invoiceFormData.due_date}
									onChange={handleInvoiceInputChange}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									required
								/>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1 text-right">
									الحالة
								</label>
								<select
									name="status"
									value={invoiceFormData.status}
									onChange={handleInvoiceInputChange}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								>
									<option value="draft">مسودة</option>
									<option value="sent">مرسلة</option>
									<option value="paid">مدفوعة</option>
									<option value="cancelled">ملغية</option>
								</select>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1 text-right">
									معدل الضريبة (%)
								</label>
								<input
									name="tax_rate"
									type="number"
									min="0"
									max="100"
									step="0.01"
									value={invoiceFormData.tax_rate ?? 0}
									onChange={handleInvoiceInputChange}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
								/>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1 text-right">
									ملاحظات
								</label>
								<textarea
									name="notes"
									value={invoiceFormData.notes ?? ""}
									onChange={handleInvoiceInputChange}
									rows={2}
									className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
									placeholder="ملاحظات إضافية"
								/>
							</div>
						</div>

						{/* Invoice Items */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<label className="block text-sm font-medium text-gray-700 text-right">
									عناصر الفاتورة *
								</label>
								<button
									type="button"
									onClick={addInvoiceItem}
									className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
								>
									<Plus size={16} />
									إضافة عنصر
								</button>
							</div>

							{/* Totals */}
							<div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
								{(() => {
									const subtotal = calcSubtotal();
									const vat = calcVat(subtotal);
									const total = calcTotal(subtotal, vat);
									return (
										<>
											<div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
												<span className="text-gray-600">
													المجموع الفرعي
												</span>
												<span className="font-semibold">
													{formatCurrency(subtotal)}
												</span>
											</div>
											<div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
												<span className="text-gray-600">
													الضريبة (
													{invoiceFormData.tax_rate ||
														0}
													%)
												</span>
												<span className="font-semibold">
													{formatCurrency(vat)}
												</span>
											</div>
											<div className="flex items-center justify-between bg-purple-50 rounded-xl p-3">
												<span className="text-gray-700 font-medium">
													الإجمالي
												</span>
												<span className="font-bold text-purple-700">
													{formatCurrency(total)}
												</span>
											</div>
										</>
									);
								})()}
							</div>

							<div className="space-y-3">
								{invoiceFormData.items
									.slice(0, 4)
									.map((item, index) => (
										<div
											key={index}
											className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
										>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-600 mb-1 text-right">
                                                المنتج/الخدمة
                                            </label>
                                            <select
                                                value={""}
                                                onChange={(e) => {
                                                    const p = products.find((pr) => pr.id === e.target.value);
                                                    if (p) {
                                                        handleInvoiceItemChange(index, "description", p.name);
                                                        handleInvoiceItemChange(index, "unit_price", p.unit_price);
                                                    }
                                                }}
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 mb-2"
                                            >
                                                <option value="">— اختر من المنتجات —</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} — {Number(p.unit_price).toFixed(2)}
                                                    </option>
                                                ))}
                                            </select>
												<label className="block text-xs text-gray-600 mb-1 text-right">
													الوصف
												</label>
												<input
													value={item.description}
													onChange={(e) =>
														handleInvoiceItemChange(
															index,
															"description",
															e.target.value
														)
													}
													className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
													required
												/>
											</div>
											<div>
												<label className="block text-xs text-gray-600 mb-1 text-right">
													الكمية
												</label>
												<input
													type="number"
													min="1"
													value={item.quantity}
													onChange={(e) =>
														handleInvoiceItemChange(
															index,
															"quantity",
															parseInt(
																e.target.value
															) || 1
														)
													}
													className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
													required
												/>
											</div>
											<div className="flex items-end gap-2">
												<div className="flex-1">
													<label className="block text-xs text-gray-600 mb-1 text-right">
														السعر
													</label>
													<input
														type="number"
														min="0"
														step="0.01"
														value={item.unit_price}
														onChange={(e) =>
															handleInvoiceItemChange(
																index,
																"unit_price",
																parseFloat(
																	e.target
																		.value
																) || 0
															)
														}
														className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
														required
													/>
												</div>
												<button
													type="button"
													onClick={() =>
														removeInvoiceItem(index)
													}
													className="text-red-600 hover:text-red-700 p-2"
													disabled={
														invoiceFormData.items
															.length === 1
													}
												>
													<Trash2 size={16} />
												</button>
											</div>
										</div>
									))}
							</div>

							{invoiceFormData.items.length > 4 && (
								<div className="text-center mt-4">
									<button
										type="button"
										onClick={addInvoiceItem}
										className="text-purple-600 hover:text-purple-700 text-sm font-medium"
									>
										+ إضافة المزيد (
										{invoiceFormData.items.length - 4} عنصر
										إضافي)
									</button>
								</div>
							)}
						</div>
					</form>
				</div>

				{/* Fixed Footer */}
				<div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
					<button
						type="button"
						onClick={closeModal}
						className="px-6 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50"
					>
						إلغاء
					</button>
					<button
						type="submit"
						onClick={handleInvoiceSubmit}
						disabled={saving}
						className="px-6 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{saving && (
							<Loader2 size={16} className="animate-spin" />
						)}

						{/* Client preview */}
						{invoiceFormData.client_id &&
							(() => {
								const selectedClient = clients.find(
									(c) => c.id === invoiceFormData.client_id
								);
								if (!selectedClient) return null;
								return (
									<div className="mt-3 rounded-xl border border-gray-200 p-3 text-sm bg-gray-50">
										<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
											<div>
												<span className="text-gray-500">
													البريد:
												</span>{" "}
												{selectedClient.email || "-"}
											</div>
											<div>
												<span className="text-gray-500">
													الهاتف:
												</span>{" "}
												{selectedClient.phone || "-"}
											</div>
											<div>
												<span className="text-gray-500">
													الشركة:
												</span>{" "}
												{selectedClient.company_name ||
													"-"}
											</div>
										</div>
									</div>
								);
							})()}
						{saving ? "جاري الحفظ..." : "إنشاء الفاتورة"}
					</button>
				</div>
			</div>
		</div>
	);
}
