"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Trash2, Plus, X, Calendar, User, FileText, Percent, Info, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
	Client,
	CreateInvoiceInput,
	CreateInvoiceItemInput,
	Product,
	InvoiceType,
} from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
		type: "standard_tax",
		document_kind: "invoice",
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
	const calcVat = (subtotal: number) => {
		// If non-tax invoice, VAT is always 0
		if (invoiceFormData.type === "non_tax") {
			return 0;
		}
		return subtotal * (Number(invoiceFormData.tax_rate || 0) / 100);
	};
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
			const {
				data: { user },
			} = await supabase.auth.getUser();
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
		const updates: any = { [name]: value };
		
		// If type changes to non_tax, enforce tax_rate = 0
		if (name === "type" && value === "non_tax") {
			updates.tax_rate = 0;
		}
		
		setInvoiceFormData((prev) => ({
			...prev,
			...updates,
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
			type: "standard_tax",
			document_kind: "invoice",
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
				const msg =
					parsed.error.issues[0]?.message || "البيانات غير صالحة";
				toast({
					title: "تحقق من المدخلات",
					description: msg,
					variant: "destructive",
				});
				return;
			}

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast({
					title: "غير مسجل",
					description: "يجب تسجيل الدخول أولاً",
					variant: "destructive",
				});
				return;
			}

			// Calculate totals based on invoice type
			const subtotal = calcSubtotal();
			const vatAmount = calcVat(subtotal);
			const totalAmount = calcTotal(subtotal, vatAmount);
			const finalTaxRate = invoiceFormData.type === "non_tax" ? 0 : (Number(invoiceFormData.tax_rate) || 0);
			
			// Create invoice
			const { data: invoiceData, error: invoiceError } = await supabase
				.from("invoices")
				.insert({
					user_id: user.id,
					client_id: invoiceFormData.client_id,
					order_id: null,
					type: invoiceFormData.type || "standard_tax",
					document_kind: invoiceFormData.document_kind || "invoice",
					issue_date: invoiceFormData.issue_date,
					due_date: invoiceFormData.due_date,
					status: invoiceFormData.status,
					tax_rate: finalTaxRate,
					subtotal: subtotal,
					vat_amount: vatAmount,
					total_amount: totalAmount,
					invoice_number: generateInvoiceNumber(),
					notes: invoiceFormData.notes,
				})
				.select("id")
				.single();

			if (invoiceError) {
				console.error("Error creating invoice:", invoiceError);
				const msg =
					invoiceError?.message ||
					invoiceError?.details ||
					"فشل في إنشاء الفاتورة";
				toast({
					title: "خطأ",
					description: msg,
					variant: "destructive",
				});
				return;
			}

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
				toast({
					title: "خطأ",
					description:
						itemsError.message || "فشل في إنشاء عناصر الفاتورة",
					variant: "destructive",
				});
				return;
			}

			try {
				await supabase.rpc("recalc_invoice_totals", {
					inv_id: invoiceData.id,
				});
			} catch {}

			toast({
				title: "تم إنشاء الفاتورة",
				description: "تم إنشاء الفاتورة بنجاح",
			});
			closeModal();
			if (onSuccess) {
				onSuccess(invoiceData.id);
			}
		} catch (err) {
			console.error("Unexpected error:", err);
			toast({
				title: "خطأ غير متوقع",
				description: "حدث خطأ غير متوقع",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const toggleNewCustomerForm = () => {
		setShowNewCustomerForm(!showNewCustomerForm);
		if (showNewCustomerForm) {
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

			if (!newCustomerData.name || !newCustomerData.email) {
				setError("الاسم والبريد الإلكتروني مطلوبان");
				return;
			}

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

			setClients((prev) => [...prev, customerData]);
			setInvoiceFormData((prev) => ({
				...prev,
				client_id: customerData.id,
			}));

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

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
            maximumFractionDigits: 2,
		}).format(amount);

	return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl z-10 overflow-hidden"
                    >
                        {/* Fixed Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">إنشاء فاتورة جديدة</h2>
                                <p className="text-gray-500 text-sm mt-1">قم بتعبئة التفاصيل أدناه لإنشاء فاتورة جديدة</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
                            >
                                <AlertCircle size={20} className="text-red-600" />
                                <span className="text-red-700 font-medium">{error}</span>
                            </motion.div>
                        )}

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <form onSubmit={handleInvoiceSubmit} className="space-y-8">
                                {/* Customer Selection Section */}
                                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <User size={20} className="text-[#7f2dfb]" />
                                            <h3>بيانات العميل</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={toggleNewCustomerForm}
                                            className="text-[#7f2dfb] hover:text-[#6a25d1] text-sm font-medium transition-colors"
                                        >
                                            {showNewCustomerForm ? "اختيار عميل موجود" : "+ عميل جديد"}
                                        </button>
                                    </div>

                                    {!showNewCustomerForm ? (
                                        <div className="relative">
                                            <select
                                                name="client_id"
                                                value={invoiceFormData.client_id}
                                                onChange={handleInvoiceInputChange}
                                                className="w-full appearance-none rounded-xl border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all bg-white"
                                                required
                                            >
                                                <option value="">اختر العميل</option>
                                                {clients.map((client) => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.name} {client.company_name ? `(${client.company_name})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                                        >
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">اسم العميل *</label>
                                                <input
                                                    name="name"
                                                    value={newCustomerData.name}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
                                                    placeholder="الاسم الكامل"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">البريد الإلكتروني *</label>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={newCustomerData.email}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
                                                    placeholder="example@domain.com"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">رقم الهاتف</label>
                                                <input
                                                    name="phone"
                                                    value={newCustomerData.phone}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
                                                    placeholder="05xxxxxxxx"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">اسم الشركة</label>
                                                <input
                                                    name="company_name"
                                                    value={newCustomerData.company_name}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
                                                    placeholder="اسم الشركة (اختياري)"
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={handleCreateNewCustomer}
                                                    className="px-6 py-2 bg-[#7f2dfb] text-white text-sm font-medium rounded-xl hover:bg-[#6a25d1] shadow-lg shadow-purple-200 transition-all"
                                                >
                                                    حفظ العميل
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Invoice Details Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <FileText size={16} className="text-gray-400" />
                                            نوع الفاتورة *
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="type"
                                                value={invoiceFormData.type || "standard_tax"}
                                                onChange={handleInvoiceInputChange}
                                                className="w-full appearance-none rounded-xl border-gray-200 px-3 py-2 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm bg-white"
                                                required
                                            >
                                                <option value="standard_tax">فاتورة ضريبية</option>
                                                <option value="simplified_tax">فاتورة ضريبية مبسطة</option>
                                                <option value="non_tax">فاتورة غير ضريبية</option>
                                            </select>
                                            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Calendar size={16} className="text-gray-400" />
                                            تاريخ الإصدار *
                                        </label>
                                        <input
                                            name="issue_date"
                                            type="date"
                                            value={invoiceFormData.issue_date}
                                            onChange={handleInvoiceInputChange}
                                            className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Calendar size={16} className="text-gray-400" />
                                            تاريخ الاستحقاق *
                                        </label>
                                        <input
                                            name="due_date"
                                            type="date"
                                            value={invoiceFormData.due_date}
                                            onChange={handleInvoiceInputChange}
                                            className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <FileText size={16} className="text-gray-400" />
                                            الحالة
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="status"
                                                value={invoiceFormData.status}
                                                onChange={handleInvoiceInputChange}
                                                className="w-full appearance-none rounded-xl border-gray-200 px-3 py-2 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm bg-white"
                                            >
                                                <option value="draft">مسودة</option>
                                                <option value="sent">مرسلة</option>
                                                <option value="paid">مدفوعة</option>
                                                <option value="cancelled">ملغية</option>
                                            </select>
                                            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Percent size={16} className="text-gray-400" />
                                            معدل الضريبة (%)
                                        </label>
                                        <input
                                            name="tax_rate"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={invoiceFormData.type === "non_tax" ? 0 : (invoiceFormData.tax_rate ?? 15)}
                                            onChange={handleInvoiceInputChange}
                                            disabled={invoiceFormData.type === "non_tax"}
                                            className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Info size={16} className="text-gray-400" />
                                            ملاحظات
                                        </label>
                                        <input
                                            name="notes"
                                            value={invoiceFormData.notes ?? ""}
                                            onChange={handleInvoiceInputChange}
                                            className="w-full rounded-xl border-gray-200 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-sm px-4 py-2"
                                            placeholder="أي ملاحظات إضافية للفاتورة..."
                                        />
                                    </div>
                                </div>

                                {/* Items Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900">عناصر الفاتورة</h3>
                                        <button
                                            type="button"
                                            onClick={addInvoiceItem}
                                            className="flex items-center gap-2 text-[#7f2dfb] hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Plus size={16} />
                                            إضافة عنصر
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {invoiceFormData.items.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group relative"
                                            >
                                                {/* Delete Button (Absolute for better layout on mobile) */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeInvoiceItem(index)}
                                                    className="absolute -left-2 -top-2 bg-white text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100"
                                                    disabled={invoiceFormData.items.length === 1}
                                                    title="حذف العنصر"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                <div className="col-span-12 md:col-span-5 space-y-1">
                                                    <label className="text-xs font-medium text-gray-500">المنتج / الوصف</label>
                                                    <div className="space-y-2">
                                                        <div className="relative">
                                                            <select
                                                                onChange={(e) => {
                                                                    const p = products.find(pr => pr.id === e.target.value);
                                                                    if (p) {
                                                                        handleInvoiceItemChange(index, "description", p.name);
                                                                        handleInvoiceItemChange(index, "unit_price", p.unit_price);
                                                                    }
                                                                }}
                                                                className="w-full appearance-none rounded-lg border-gray-200 text-xs py-2 px-3 focus:border-[#7f2dfb] focus:ring-[#7f2dfb] bg-white"
                                                            >
                                                                <option value="">اختر منتجاً (اختياري)</option>
                                                                {products.map((p) => (
                                                                    <option key={p.id} value={p.id}>
                                                                        {p.name} ({p.unit_price} ريال)
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                                        </div>
                                                        <input
                                                            value={item.description}
                                                            onChange={(e) => handleInvoiceItemChange(index, "description", e.target.value)}
                                                            className="w-full rounded-lg border-gray-200 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] px-3 py-2"
                                                            placeholder="وصف العنصر"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-span-4 md:col-span-2 space-y-1">
                                                    <label className="text-xs font-medium text-gray-500">الكمية</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleInvoiceItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                                                        className="w-full rounded-lg border-gray-200 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] text-center px-2 py-2"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-4 md:col-span-2 space-y-1">
                                                    <label className="text-xs font-medium text-gray-500">سعر الوحدة</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleInvoiceItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                                                        className="w-full rounded-lg border-gray-200 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] px-3 py-2"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-4 md:col-span-3 space-y-1">
                                                    <label className="text-xs font-medium text-gray-500">الإجمالي</label>
                                                    <div className="w-full h-[38px] flex items-center px-3 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">
                                                        {formatCurrency((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals Summary */}
                                <div className="flex flex-col md:flex-row justify-end gap-6 pt-6 border-t border-gray-100">
                                    <div className="w-full md:w-80 space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        {(() => {
                                            const subtotal = calcSubtotal();
                                            const vat = calcVat(subtotal);
                                            const total = calcTotal(subtotal, vat);
                                            return (
                                                <>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">المجموع الفرعي</span>
                                                        <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                                                    </div>
                                                    {invoiceFormData.type !== "non_tax" && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">الضريبة ({invoiceFormData.tax_rate}%)</span>
                                                            <span className="font-medium text-gray-900">{formatCurrency(vat)}</span>
                                                        </div>
                                                    )}
                                                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                                        <span className="text-base font-bold text-gray-900">الإجمالي</span>
                                                        <span className="text-xl font-bold text-[#7f2dfb]">{formatCurrency(total)}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Fixed Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
                            <div className="hidden md:block text-sm text-gray-500">
                                {invoiceFormData.client_id ? (
                                    <span className="flex items-center gap-2">
                                        <User size={16} />
                                        جاري إنشاء الفاتورة لـ <span className="font-semibold text-gray-900">{clients.find(c => c.id === invoiceFormData.client_id)?.name}</span>
                                    </span>
                                ) : (
                                    <span>يرجى اختيار العميل أولاً</span>
                                )}
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-white hover:border-gray-300 transition-all text-sm"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleInvoiceSubmit}
                                    disabled={saving}
                                    className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6a25d1] shadow-lg shadow-purple-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                    {saving ? "جاري الحفظ..." : "إنشاء الفاتورة"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
	);
}
