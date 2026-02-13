import { apiClient } from './client';
import type {
	CatalogCategory,
	CatalogCategoryListResponse,
	CatalogItem,
	CatalogItemListResponse,
	CartResponse,
	CartItemResponse,
	CartValidationResponse,
	CartSubmissionResponse,
	AddToCartRequest,
	UpdateCartItemRequest,
	SubmitCartRequest,
	CreateCategoryRequest,
	UpdateCategoryRequest,
	CreateCatalogItemRequest,
	UpdateCatalogItemRequest
} from './types';

function buildQs(params: Record<string, string | number | boolean | undefined | null>): string {
	const sp = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== null) sp.set(k, String(v));
	}
	const qs = sp.toString();
	return qs ? `?${qs}` : '';
}

// --- Catalog Browsing ---

export async function listCategories(
	params: { limit?: number; offset?: number; parent_id?: string | null },
	token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogCategoryListResponse> {
	const qs = buildQs({ limit: params.limit, offset: params.offset, parent_id: params.parent_id ?? undefined });
	return apiClient<CatalogCategoryListResponse>(`/governance/catalog/categories${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function getCategory(
	id: string, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogCategory> {
	return apiClient<CatalogCategory>(`/governance/catalog/categories/${id}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function listCatalogItems(
	params: { category_id?: string; item_type?: string; search?: string; tag?: string; beneficiary_id?: string; limit?: number; offset?: number },
	token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogItemListResponse> {
	const qs = buildQs(params);
	return apiClient<CatalogItemListResponse>(`/governance/catalog/items${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function getCatalogItem(
	id: string, beneficiaryId: string | undefined, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogItem> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	return apiClient<CatalogItem>(`/governance/catalog/items/${id}${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

// --- Shopping Cart ---

export async function getCart(
	beneficiaryId: string | undefined, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CartResponse> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	return apiClient<CartResponse>(`/governance/catalog/cart${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function addToCart(
	body: AddToCartRequest, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CartItemResponse> {
	return apiClient<CartItemResponse>('/governance/catalog/cart/items', { method: 'POST', body, token, tenantId, fetch: fetchFn });
}

export async function updateCartItem(
	itemId: string, body: UpdateCartItemRequest, beneficiaryId: string | undefined,
	token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CartItemResponse> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	return apiClient<CartItemResponse>(`/governance/catalog/cart/items/${itemId}${qs}`, { method: 'PUT', body, token, tenantId, fetch: fetchFn });
}

export async function removeCartItem(
	itemId: string, beneficiaryId: string | undefined, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<void> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	await apiClient<void>(`/governance/catalog/cart/items/${itemId}${qs}`, { method: 'DELETE', token, tenantId, fetch: fetchFn });
}

export async function clearCart(
	beneficiaryId: string | undefined, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<void> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	await apiClient<void>(`/governance/catalog/cart${qs}`, { method: 'DELETE', token, tenantId, fetch: fetchFn });
}

export async function validateCart(
	beneficiaryId: string | undefined, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CartValidationResponse> {
	const qs = beneficiaryId ? `?beneficiary_id=${beneficiaryId}` : '';
	return apiClient<CartValidationResponse>(`/governance/catalog/cart/validate${qs}`, { method: 'POST', token, tenantId, fetch: fetchFn });
}

export async function submitCart(
	body: SubmitCartRequest, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CartSubmissionResponse> {
	return apiClient<CartSubmissionResponse>('/governance/catalog/cart/submit', { method: 'POST', body, token, tenantId, fetch: fetchFn });
}

// --- Catalog Admin ---

export async function adminListCategories(
	params: { limit?: number; offset?: number; parent_id?: string },
	token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogCategoryListResponse> {
	const qs = buildQs(params);
	return apiClient<CatalogCategoryListResponse>(`/governance/admin/catalog/categories${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function adminCreateCategory(
	body: CreateCategoryRequest, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogCategory> {
	return apiClient<CatalogCategory>('/governance/admin/catalog/categories', { method: 'POST', body, token, tenantId, fetch: fetchFn });
}

export async function adminUpdateCategory(
	id: string, body: UpdateCategoryRequest, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogCategory> {
	return apiClient<CatalogCategory>(`/governance/admin/catalog/categories/${id}`, { method: 'PUT', body, token, tenantId, fetch: fetchFn });
}

export async function adminDeleteCategory(
	id: string, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<void>(`/governance/admin/catalog/categories/${id}`, { method: 'DELETE', token, tenantId, fetch: fetchFn });
}

export async function adminListItems(
	params: { category_id?: string; item_type?: string; enabled?: boolean; search?: string; tag?: string; limit?: number; offset?: number },
	token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogItemListResponse> {
	const qs = buildQs(params as Record<string, string | number | boolean | undefined>);
	return apiClient<CatalogItemListResponse>(`/governance/admin/catalog/items${qs}`, { method: 'GET', token, tenantId, fetch: fetchFn });
}

export async function adminCreateItem(
	body: CreateCatalogItemRequest, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogItem> {
	return apiClient<CatalogItem>('/governance/admin/catalog/items', { method: 'POST', body, token, tenantId, fetch: fetchFn });
}

export async function adminUpdateItem(
	id: string, body: UpdateCatalogItemRequest, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogItem> {
	return apiClient<CatalogItem>(`/governance/admin/catalog/items/${id}`, { method: 'PUT', body, token, tenantId, fetch: fetchFn });
}

export async function adminEnableItem(
	id: string, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogItem> {
	return apiClient<CatalogItem>(`/governance/admin/catalog/items/${id}/enable`, { method: 'POST', token, tenantId, fetch: fetchFn });
}

export async function adminDisableItem(
	id: string, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<CatalogItem> {
	return apiClient<CatalogItem>(`/governance/admin/catalog/items/${id}/disable`, { method: 'POST', token, tenantId, fetch: fetchFn });
}

export async function adminDeleteItem(
	id: string, token: string, tenantId: string, fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<void>(`/governance/admin/catalog/items/${id}`, { method: 'DELETE', token, tenantId, fetch: fetchFn });
}
