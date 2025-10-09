// Database Types for Bilfora Application
// These types match the Supabase database schema exactly

export type Gender = "male" | "female";
export type AccountType = "individual" | "business";
export type ClientStatus = "active" | "inactive";
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

// Base database table interfaces
export interface Profile {
	id: string; // UUID, FK to auth.users
	full_name: string;
	phone: string;
	dob: string; // Date as ISO string
	gender: Gender | null;
	account_type: AccountType;
	avatar_url: string | null;
	company_name: string | null;
	tax_number: string | null;
	address: string | null;
	city: string | null;
	created_at: string; // Timestamptz as ISO string
	updated_at: string; // Timestamptz as ISO string
}

export interface Client {
	id: string; // UUID
	user_id: string; // UUID, FK to profiles.id
	name: string;
	email: string;
	phone: string;
	company_name: string | null;
	tax_number: string | null;
	address: string | null;
	city: string | null;
	notes: string | null;
	status: ClientStatus;
	created_at: string; // Timestamptz as ISO string
	updated_at: string; // Timestamptz as ISO string
}

export interface Order {
	id: string; // UUID
	user_id: string; // UUID, FK to profiles.id
	client_id: string; // UUID, FK to clients.id
	order_number: string; // Unique identifier
	status: OrderStatus;
	total_amount: number; // Decimal as number
	notes: string | null;
	created_at: string; // Timestamptz as ISO string
	updated_at: string; // Timestamptz as ISO string
}

export interface OrderItem {
	id: string; // UUID
	order_id: string; // UUID, FK to orders.id
	description: string;
	quantity: number;
	unit_price: number; // Decimal as number
	total: number; // Decimal as number
}

export interface Invoice {
	id: string; // UUID
	user_id: string; // UUID, FK to profiles.id
	client_id: string; // UUID, FK to clients.id
	order_id: string | null; // UUID, FK to orders.id
	invoice_number: string; // Unique identifier
	issue_date: string; // Date as ISO string
	due_date: string; // Date as ISO string
	status: InvoiceStatus;
	subtotal: number; // Decimal as number
	tax_rate: number; // Decimal as number (default 15.00)
	tax_amount: number; // Decimal as number
	total_amount: number; // Decimal as number
	notes: string | null;
	created_at: string; // Timestamptz as ISO string
	updated_at: string; // Timestamptz as ISO string
}

export interface InvoiceItem {
	id: string; // UUID
	invoice_id: string; // UUID, FK to invoices.id
	description: string;
	quantity: number;
	unit_price: number; // Decimal as number
	total: number; // Decimal as number
}

// Extended interfaces with relationships
export interface OrderWithClient extends Order {
	client: Client;
}

export interface OrderWithItems extends Order {
	items: OrderItem[];
}

export interface OrderWithClientAndItems extends Order {
	client: Client;
	items: OrderItem[];
}

export interface InvoiceWithClient extends Invoice {
	client: Client;
}

export interface InvoiceWithItems extends Invoice {
	items: InvoiceItem[];
}

export interface InvoiceWithClientAndItems extends Invoice {
	client: Client;
	items: InvoiceItem[];
}

export interface InvoiceWithOrder extends Invoice {
	order: Order | null;
}

export interface InvoiceWithOrderAndClient extends Invoice {
	order: Order | null;
	client: Client;
}

// Form input types (for creating/updating records)
export interface CreateProfileInput {
	full_name: string;
	phone: string;
	dob: string;
	gender?: Gender | null;
	account_type: AccountType;
	avatar_url?: string | null;
	company_name?: string | null;
	tax_number?: string | null;
	address?: string | null;
	city?: string | null;
}

export interface UpdateProfileInput extends Partial<CreateProfileInput> {
	id: string;
}

export interface CreateClientInput {
	name: string;
	email: string;
	phone: string;
	company_name?: string | null;
	tax_number?: string | null;
	address?: string | null;
	city?: string | null;
	notes?: string | null;
	status?: ClientStatus;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
	id: string;
}

export interface CreateOrderInput {
	client_id: string;
	status?: OrderStatus;
	notes?: string | null;
	items: CreateOrderItemInput[];
}

export interface CreateOrderItemInput {
	description: string;
	quantity: number;
	unit_price: number;
}

export interface UpdateOrderInput {
	id: string;
	client_id?: string;
	status?: OrderStatus;
	notes?: string | null;
}

export interface CreateInvoiceInput {
	client_id: string;
	order_id?: string | null;
	issue_date: string;
	due_date: string;
	status?: InvoiceStatus;
	tax_rate?: number;
	notes?: string | null;
	items: CreateInvoiceItemInput[];
}

export interface CreateInvoiceItemInput {
	description: string;
	quantity: number;
	unit_price: number;
}

export interface UpdateInvoiceInput {
	id: string;
	client_id?: string;
	order_id?: string | null;
	issue_date?: string;
	due_date?: string;
	status?: InvoiceStatus;
	tax_rate?: number;
	notes?: string | null;
}

// Dashboard statistics types
export interface DashboardStats {
	totalOrders: number;
	pendingOrders: number;
	totalRevenue: number;
	activeCustomers: number;
}

export interface MonthlyData {
	name: string; // Month name in Arabic
	orders: number;
	revenue: number;
}

export interface OrderStatusData {
	name: string; // Status name in Arabic
	value: number;
	color: string;
}

export interface CustomerData {
	name: string; // Customer type name in Arabic
	value: number;
}

// API response types
export interface ApiResponse<T> {
	data: T | null;
	error: string | null;
	success: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	count: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

// Supabase query types
export interface SupabaseQueryOptions {
	page?: number;
	pageSize?: number;
	orderBy?: string;
	orderDirection?: "asc" | "desc";
	filters?: Record<string, any>;
}

// Error types
export interface DatabaseError {
	code: string;
	message: string;
	details?: string;
	hint?: string;
}

// Utility types
export type TableName =
	| "profiles"
	| "clients"
	| "orders"
	| "order_items"
	| "invoices"
	| "invoice_items";

export type Insertable<T> = Omit<T, "id" | "created_at" | "updated_at">;
export type Updatable<T> = Partial<
	Omit<T, "id" | "created_at" | "updated_at">
> & { id: string };

// Re-export commonly used types
export type { Gender, AccountType, ClientStatus, OrderStatus, InvoiceStatus };
