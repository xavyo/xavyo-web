export class JsonObjectError extends Error {
	constructor(message = 'Value must be a JSON object') {
		super(message);
		this.name = 'JsonObjectError';
	}
}

/** Parse JSON that must be a non-array object. Arrays/null/scalars are rejected. */
export function parseJsonRecord(text: string): Record<string, unknown> {
	const parsed: unknown = JSON.parse(text);
	if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new JsonObjectError();
	}
	return parsed as Record<string, unknown>;
}

/** Parse JSON that must be an object whose values are strings. */
export function parseJsonStringRecord(text: string): Record<string, string> {
	const obj = parseJsonRecord(text);
	for (const value of Object.values(obj)) {
		if (typeof value !== 'string') {
			throw new JsonObjectError('JSON object values must be strings');
		}
	}
	return obj as Record<string, string>;
}

export function isJsonParseError(e: unknown): boolean {
	return e instanceof SyntaxError || e instanceof JsonObjectError;
}

function isBlank(raw: unknown): boolean {
	return raw == null || raw === '';
}

function toFiniteInteger(raw: unknown): number | undefined {
	if (isBlank(raw)) return undefined;
	const parsed = typeof raw === 'number' ? raw : Number(String(raw));
	return Number.isFinite(parsed) && Number.isInteger(parsed) ? parsed : undefined;
}

function parseIntegerInRange(raw: unknown, min: number, max: number, field: string): number {
	const parsed = toFiniteInteger(raw);
	if (parsed == null || parsed < min || parsed > max) {
		throw new JsonObjectError(`${field} must be an integer between ${min} and ${max}`);
	}
	return parsed;
}

/** Reject NaN / Infinity that `typeof === 'number'` would still accept. */
export function requireFiniteNumber(raw: unknown, field: string): number {
	if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
	if (typeof raw === 'string' && raw.trim() !== '') {
		const parsed = Number(raw);
		if (Number.isFinite(parsed)) return parsed;
	}
	throw new JsonObjectError(`${field} must be a finite number`);
}

/** Empty/missing → undefined. Invalid or out-of-range throws instead of forwarding NaN. */
export function parseOptionalBoundedInteger(
	raw: unknown,
	min: number,
	max: number,
	field: string
): number | undefined {
	if (isBlank(raw)) return undefined;
	return parseIntegerInRange(raw, min, max, field);
}

/** Empty uses `fallback` when provided. Invalid or out-of-range throws instead of forwarding NaN. */
export function parseBoundedInteger(
	raw: unknown,
	min: number,
	max: number,
	field: string,
	fallback?: number
): number {
	if (isBlank(raw)) {
		if (fallback === undefined) {
			throw new JsonObjectError(`${field} is required`);
		}
		return parseIntegerInRange(fallback, min, max, field);
	}
	return parseIntegerInRange(raw, min, max, field);
}

/** TCP port. Empty uses `fallback`; 0 / NaN / out-of-range are rejected. */
export function parsePortNumber(raw: unknown, fallback: number): number {
	if (isBlank(raw)) {
		return parseIntegerInRange(fallback, 1, 65535, 'Port');
	}
	return parseIntegerInRange(raw, 1, 65535, 'Port');
}

/** Parse JSON that must be an array. Objects/null/scalars are rejected. */
export function parseJsonArray(text: string): unknown[] {
	const parsed: unknown = JSON.parse(text);
	if (!Array.isArray(parsed)) {
		throw new JsonObjectError('Value must be a JSON array');
	}
	return parsed;
}

/** Parse JSON that must be an array of strings. */
export function parseJsonStringArray(text: string): string[] {
	const arr = parseJsonArray(text);
	if (!arr.every((v) => typeof v === 'string')) {
		throw new JsonObjectError('JSON array values must be strings');
	}
	return arr as string[];
}
