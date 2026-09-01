import { JsonObjectError } from '$lib/utils/json-record';

export function finiteNumber(raw: string | null): number | undefined {
	if (raw == null || raw === '') return undefined;
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : undefined;
}

/** Drop non-integer values instead of forwarding NaN from parseInt(). */
export function finiteInteger(raw: string | null | undefined): number | undefined {
	const parsed = finiteNumber(raw ?? null);
	return parsed != null && Number.isInteger(parsed) ? parsed : undefined;
}

function isBlank(raw: unknown): boolean {
	return raw == null || raw === '';
}

function parseIntegerInRange(raw: unknown, min: number, max: number, field: string): number {
	const parsed = finiteInteger(String(raw));
	if (parsed == null || parsed < min || parsed > max) {
		throw new JsonObjectError(`${field} must be an integer between ${min} and ${max}`);
	}
	return parsed;
}

/** TCP port. Empty uses `fallback`; 0 / NaN / out-of-range are rejected (not silently defaulted). */
export function parsePortNumber(raw: unknown, fallback: number): number {
	if (isBlank(raw)) {
		return parseIntegerInRange(fallback, 1, 65535, 'Port');
	}
	return parseIntegerInRange(raw, 1, 65535, 'Port');
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

/** Map UI `page`/`page_size` onto the API `limit`/`offset` contract. */
export function listPagination(url: URL): { limit?: number; offset?: number } {
	const limit = finiteNumber(url.searchParams.get('limit') ?? url.searchParams.get('page_size'));

	if (url.searchParams.has('offset')) {
		return {
			limit,
			offset: finiteNumber(url.searchParams.get('offset'))
		};
	}

	if (url.searchParams.has('page') && limit != null) {
		const parsedPage = finiteNumber(url.searchParams.get('page'));
		if (parsedPage != null) {
			return { limit, offset: Math.max(0, (Math.max(1, parsedPage) - 1) * limit) };
		}
	}

	return { limit, offset: undefined };
}

/** Drop non-finite `page`/`page_size` instead of forwarding NaN. */
export function pagePagination(url: URL): { page?: number; page_size?: number } {
	return {
		page: finiteNumber(url.searchParams.get('page')),
		page_size: finiteNumber(url.searchParams.get('page_size') ?? url.searchParams.get('limit'))
	};
}
