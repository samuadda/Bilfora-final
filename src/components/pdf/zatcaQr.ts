/**
 * ZATCA TLV Encoding Helper
 * 
 * Implements TLV (Tag-Length-Value) encoding as per ZATCA specification:
 * - Tag 1: Seller name (UTF-8 string)
 * - Tag 2: VAT registration number
 * - Tag 3: Timestamp (ISO8601)
 * - Tag 4: Invoice total (with VAT)
 * - Tag 5: VAT total
 */

export function encodeTLV(tag: number, value: string): Uint8Array {
	const textEncoder = new TextEncoder();
	const valueBytes = textEncoder.encode(value);
	const result = new Uint8Array(2 + valueBytes.length);
	result[0] = tag;
	result[1] = valueBytes.length;
	result.set(valueBytes, 2);
	return result;
}

export function generateZatcaTLVBase64(params: {
	sellerName: string;
	vatNumber: string;
	timestamp: string; // ISO string
	invoiceTotal: string; // e.g. '17250.00'
	vatTotal: string; // e.g. '2250.00'
}): string {
	// Guard against SSR
	if (typeof window === "undefined") {
		return "";
	}

	const parts = [
		encodeTLV(1, params.sellerName),
		encodeTLV(2, params.vatNumber),
		encodeTLV(3, params.timestamp),
		encodeTLV(4, params.invoiceTotal),
		encodeTLV(5, params.vatTotal),
	];

	let totalLength = 0;
	parts.forEach((p) => (totalLength += p.length));
	const tlvBytes = new Uint8Array(totalLength);
	let offset = 0;
	for (const p of parts) {
		tlvBytes.set(p, offset);
		offset += p.length;
	}

	// Convert to base64
	let binary = "";
	for (let i = 0; i < tlvBytes.length; i++) {
		binary += String.fromCharCode(tlvBytes[i]);
	}

	// btoa is available in the browser
	return btoa(binary);
}

