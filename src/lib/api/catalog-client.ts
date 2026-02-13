import type {
	CatalogCategoryListResponse,
	CatalogItemListResponse,
	CatalogItem,
	CartResponse,
	CartItemResponse,
	CartValidationResponse,
	CartSubmissionResponse
} from './types';

function buildQs(params: Record<string, string | number | boolean | undefined | null>): string {
	const sp = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== null) sp.set(k, String(v));
	}
	const qs = sp.toString();
	return qs ? `?${qs}` : '';
}

export async function listCategoriesClient(
	params: { limit?: number; offset?: number; parent_id?: string | null } = {},
	fetchFn: typeof fetch = fetch
): Promise<CatalogCategoryListResponse> {
	const qs = buildQs({ limit: params.limit, offset: params.offset, parent_id: params.parent_id ?? undefined });
	const res = await fetchFn(`/api/governance/catalog/categories${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
	return res.json();
}

export async function listCatalogItemsClient(
	params: { category_id?: string; item_type?: string; search?: string; tag?: string; beneficiary_id?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<CatalogItemListResponse> {
	const qs = buildQs(params);
	const res = await fetchFn(`/api/governance/catalog/items${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch catalog items: ${res.status}`);
	return res.json();
}

export async function getCatalogItemClient(
	id: string, beneficiaryId?: string, fetchFn: typeof fetch = fetch
): Promise<CatalogItem> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	const res = await fetchFn(`/api/governance/catalog/items/${id}${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch catalog item: ${res.status}`);
	return res.json();
}

export async function getCartClient(
	beneficiaryId?: string, fetchFn: typeof fetch = fetch
): Promise<CartResponse> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	const res = await fetchFn(`/api/governance/catalog/cart${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch cart: ${res.status}`);
	return res.json();
}

export async function addToCartClient(
	catalogItemId: string, beneficiaryId?: string, params?: Record<string, unknown>, formValues?: Record<string, unknown>,
	fetchFn: typeof fetch = fetch
): Promise<CartItemResponse> {
	const res = await fetchFn('/api/governance/catalog/cart/items', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ catalog_item_id: catalogItemId, beneficiary_id: beneficiaryId, parameters: params, form_values: formValues })
	});
	if (!res.ok) throw new Error(`Failed to add to cart: ${res.status}`);
	return res.json();
}

export async function updateCartItemClient(
	itemId: string, body: { parameters?: Record<string, unknown>; form_values?: Record<string, unknown> },
	beneficiaryId?: string, fetchFn: typeof fetch = fetch
): Promise<CartItemResponse> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	const res = await fetchFn(`/api/governance/catalog/cart/items/${itemId}${qs}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to update cart item: ${res.status}`);
	return res.json();
}

export async function removeCartItemClient(
	itemId: string, beneficiaryId?: string, fetchFn: typeof fetch = fetch
): Promise<void> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	const res = await fetchFn(`/api/governance/catalog/cart/items/${itemId}${qs}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Failed to remove cart item: ${res.status}`);
}

export async function clearCartClient(
	beneficiaryId?: string, fetchFn: typeof fetch = fetch
): Promise<void> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	const res = await fetchFn(`/api/governance/catalog/cart${qs}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Failed to clear cart: ${res.status}`);
}

export async function validateCartClient(
	beneficiaryId?: string, fetchFn: typeof fetch = fetch
): Promise<CartValidationResponse> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	const res = await fetchFn(`/api/governance/catalog/cart/validate${qs}`, { method: 'POST' });
	if (!res.ok) throw new Error(`Failed to validate cart: ${res.status}`);
	return res.json();
}

export async function submitCartClient(
	body: { beneficiary_id?: string; global_justification?: string },
	fetchFn: typeof fetch = fetch
): Promise<CartSubmissionResponse> {
	const res = await fetchFn('/api/governance/catalog/cart/submit', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to submit cart: ${res.status}`);
	return res.json();
}
