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
