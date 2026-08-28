/** Map UI `page`/`page_size` onto the API `limit`/`offset` contract. */
export function listPagination(url: URL): { limit?: number; offset?: number } {
	const rawLimit = url.searchParams.get('limit') ?? url.searchParams.get('page_size');
	const parsedLimit = rawLimit != null && rawLimit !== '' ? Number(rawLimit) : undefined;
	const limit = parsedLimit != null && Number.isFinite(parsedLimit) ? parsedLimit : undefined;

	if (url.searchParams.has('offset')) {
		const parsedOffset = Number(url.searchParams.get('offset'));
		return {
			limit,
			offset: Number.isFinite(parsedOffset) ? parsedOffset : undefined
		};
	}

	if (url.searchParams.has('page') && limit != null) {
		const parsedPage = Number(url.searchParams.get('page'));
		if (Number.isFinite(parsedPage)) {
			return { limit, offset: Math.max(0, (Math.max(1, parsedPage) - 1) * limit) };
		}
	}

	return { limit, offset: undefined };
}
