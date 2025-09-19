"use client";

import { useMemo, useRef, useState } from "react";
import {
	Mail,
	MessageSquare,
	Bell,
	FileText,
	CheckCircle,
	AlertCircle,
	ShieldCheck,
	BadgeCheck,
	AlertTriangle,
	Clock4,
	Send,
	RotateCcw,
	Save,
} from "lucide-react";

type Frequency = "immediate" | "daily" | "weekly";

type TypeKey =
	| "newInvoice"
	| "paymentReceived"
	| "overdueReminder"
	| "systemAlerts"
	| "securityAlerts";

type Channels = { email: boolean; sms: boolean };

interface MatrixState {
	newInvoice: Channels;
	paymentReceived: Channels;
	overdueReminder: Channels;
	systemAlerts: Channels;
	securityAlerts: Channels;
	channels: Channels;
	pausedAll: boolean;
	frequency: Frequency;
	dnd: { enabled: boolean; start: string; end: string };
	snoozeUntil: string;
	verified: { email: boolean; sms: boolean };
}

const defaultState: MatrixState = {
	newInvoice: { email: true, sms: false },
	paymentReceived: { email: true, sms: false },
	overdueReminder: { email: true, sms: true },
	systemAlerts: { email: true, sms: false },
	securityAlerts: { email: true, sms: false },
	channels: { email: true, sms: false },
	pausedAll: false,
	frequency: "immediate",
	dnd: { enabled: false, start: "22:00", end: "08:00" },
	snoozeUntil: "",
	verified: { email: true, sms: false },
};

export default function NotificationsPage() {
	const [state, setState] = useState<MatrixState>(defaultState);
	const initialRef = useRef<MatrixState>(defaultState);
	const [saving, setSaving] = useState(false);

	const dirty = useMemo(
		() => JSON.stringify(state) !== JSON.stringify(initialRef.current),
		[state]
	);

	const setChannel = (key: keyof MatrixState["channels"], value: boolean) =>
		setState((s) => ({ ...s, channels: { ...s.channels, [key]: value } }));

	const setTypeChannel = (
		typeKey: TypeKey,
		channel: keyof Channels,
		value: boolean
	) =>
		setState((s) => ({
			...s,
			[typeKey]: { ...s[typeKey], [channel]: value },
		}));

	const selectAll = () => {
		setState((s) => ({
			...s,
			channels: { email: true, sms: true },
			newInvoice: { email: true, sms: true },
			paymentReceived: { email: true, sms: true },
			overdueReminder: { email: true, sms: true },
			systemAlerts: { email: true, sms: true },
			securityAlerts: { email: true, sms: true },
		}));
	};

	const resetDefaults = () => setState(defaultState);

	const onSave = async () => {
		setSaving(true);
		setTimeout(() => {
			initialRef.current = state;
			setSaving(false);
		}, 600);
	};

	const onDiscard = () => setState(initialRef.current);

	const emailDisabled = !state.channels.email || state.pausedAll;
	const smsDisabled = !state.channels.sms || state.pausedAll;

	return (
		<div className="space-y-6 pb-24">
			{/* Header */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							الإشعارات
						</h1>
						<p className="text-gray-500 mt-1">
							قم بتشغيل أو إيقاف أنواع الإشعارات عبر قنوات مختلفة
						</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={selectAll}
							className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
						>
							<CheckCircle size={14} /> تحديد الكل
						</button>
						<button
							onClick={resetDefaults}
							className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
						>
							<RotateCcw size={14} /> استعادة الافتراضي
						</button>
					</div>
				</div>
			</div>

			{/* Channels with verification and test */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">قنوات الإشعارات</h2>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-gray-700">
							<Mail size={16} className="text-purple-600" />{" "}
							البريد الإلكتروني
							{state.verified.email ? (
								<span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
									<BadgeCheck size={14} /> موثق
								</span>
							) : (
								<button className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
									<AlertTriangle size={14} /> تحقق/إعادة
									الإرسال
								</button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs hover:bg-gray-50">
								<Send size={12} /> إرسال اختبار
							</button>
							<input
								type="checkbox"
								checked={state.channels.email}
								onChange={(e) =>
									setChannel("email", e.target.checked)
								}
								className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
							/>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-sm text-gray-700">
							<MessageSquare
								size={16}
								className="text-purple-600"
							/>{" "}
							الرسائل القصيرة SMS
							{state.verified.sms ? (
								<span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
									<BadgeCheck size={14} /> موثق
								</span>
							) : (
								<button className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
									<AlertTriangle size={14} /> تحقق/إعادة
									الإرسال
								</button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs hover:bg-gray-50">
								<Send size={12} /> إرسال اختبار
							</button>
							<input
								type="checkbox"
								checked={state.channels.sms}
								onChange={(e) =>
									setChannel("sms", e.target.checked)
								}
								className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Matrix */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">
					اختيار القناة لكل نوع
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-gray-500">
								<th className="text-right px-3 py-2">النوع</th>
								<th className="text-center px-3 py-2">Email</th>
								<th className="text-center px-3 py-2">SMS</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{(
								[
									{
										key: "newInvoice",
										labelIcon: (
											<FileText
												size={14}
												className="text-blue-600"
											/>
										),
										label: "فواتير جديدة صادرة",
									},
									{
										key: "paymentReceived",
										labelIcon: (
											<CheckCircle
												size={14}
												className="text-green-600"
											/>
										),
										label: "استلام دفعة",
									},
									{
										key: "overdueReminder",
										labelIcon: (
											<AlertCircle
												size={14}
												className="text-orange-600"
											/>
										),
										label: "تذكير بفاتورة غير مدفوعة",
									},
									{
										key: "systemAlerts",
										labelIcon: (
											<Bell
												size={14}
												className="text-gray-700"
											/>
										),
										label: "إشعارات النظام",
									},
									{
										key: "securityAlerts",
										labelIcon: (
											<ShieldCheck
												size={14}
												className="text-purple-600"
											/>
										),
										label: "الأمان",
									},
								] as {
									key: TypeKey;
									labelIcon: React.ReactNode;
									label: string;
								}[]
							).map((row) => (
								<tr key={row.key} className="bg-white">
									<td className="px-3 py-2">
										<span className="inline-flex items-center gap-2">
											{row.labelIcon} {row.label}
										</span>
									</td>
									<td className="px-3 py-2 text-center">
										<input
											type="checkbox"
											checked={state[row.key].email}
											onChange={(e) =>
												setTypeChannel(
													row.key,
													"email",
													e.target.checked
												)
											}
											disabled={emailDisabled}
											className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 disabled:opacity-40"
										/>
									</td>
									<td className="px-3 py-2 text-center">
										<input
											type="checkbox"
											checked={state[row.key].sms}
											onChange={(e) =>
												setTypeChannel(
													row.key,
													"sms",
													e.target.checked
												)
											}
											disabled={smsDisabled}
											className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600 disabled:opacity-40"
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Advanced: frequency, DND, snooze, pause */}
			<div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
				<h2 className="text-lg font-semibold mb-4">خيارات متقدمة</h2>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					<div className="flex items-center gap-3">
						<label className="text-sm text-gray-600">التكرار</label>
						<select
							value={state.frequency}
							onChange={(e) =>
								setState((s) => ({
									...s,
									frequency: e.target.value as Frequency,
								}))
							}
							className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
						>
							<option value="immediate">فوري</option>
							<option value="daily">ملخص يومي</option>
							<option value="weekly">ملخص أسبوعي</option>
						</select>
					</div>
					<div className="flex items-center gap-3">
						<label className="text-sm text-gray-600">
							وضع عدم الإزعاج
						</label>
						<input
							type="checkbox"
							checked={state.dnd.enabled}
							onChange={(e) =>
								setState((s) => ({
									...s,
									dnd: {
										...s.dnd,
										enabled: e.target.checked,
									},
								}))
							}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-purple-600"
						/>
						<div className="flex items-center gap-2 text-sm text-gray-700">
							<Clock4 size={16} className="text-gray-500" />
							<input
								type="time"
								value={state.dnd.start}
								onChange={(e) =>
									setState((s) => ({
										...s,
										dnd: {
											...s.dnd,
											start: e.target.value,
										},
									}))
								}
								className="rounded-lg border border-gray-200 px-2 py-1"
							/>
							<span>إلى</span>
							<input
								type="time"
								value={state.dnd.end}
								onChange={(e) =>
									setState((s) => ({
										...s,
										dnd: { ...s.dnd, end: e.target.value },
									}))
								}
								className="rounded-lg border border-gray-200 px-2 py-1"
							/>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<label className="text-sm text-gray-600">
							إيقاف مؤقت حتى
						</label>
						<input
							type="datetime-local"
							value={state.snoozeUntil}
							onChange={(e) =>
								setState((s) => ({
									...s,
									snoozeUntil: e.target.value,
								}))
							}
							className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
						/>
					</div>
				</div>
				<div className="mt-4">
					<label className="flex items-center gap-2 text-sm text-gray-700">
						<Bell size={16} className="text-red-600" />
						<input
							type="checkbox"
							checked={state.pausedAll}
							onChange={(e) =>
								setState((s) => ({
									...s,
									pausedAll: e.target.checked,
								}))
							}
							className="h-5 w-5 rounded-md border border-gray-300 bg-white accent-red-600"
						/>
						<span>إيقاف كل الإشعارات مؤقتًا</span>
					</label>
				</div>
				{state.pausedAll && (
					<p className="text-xs text-red-600 mt-3">
						تم إيقاف جميع الإشعارات مؤقتًا. يمكنك إعادة تشغيلها في
						أي وقت.
					</p>
				)}
			</div>

			{/* Sticky save bar */}
			{dirty && (
				<div className="fixed bottom-4 right-4 left-4 md:left-auto md:right-6 z-50">
					<div className="bg-white border shadow-lg rounded-xl px-4 py-3 flex items-center justify-between gap-3">
						<div className="text-sm text-gray-700">
							لديك تغييرات غير محفوظة
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={onDiscard}
								className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
							>
								<RotateCcw size={14} /> تجاهل
							</button>
							<button
								onClick={onSave}
								disabled={saving}
								className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-60"
							>
								<Save size={14} />{" "}
								{saving ? "جارٍ الحفظ…" : "حفظ"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
