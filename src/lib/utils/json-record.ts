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
