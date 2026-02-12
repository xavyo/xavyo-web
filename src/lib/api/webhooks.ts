import { apiClient } from './client';
import type {
	WebhookEventTypeListResponse,
	WebhookSubscriptionListResponse,
	WebhookSubscription,
	CreateWebhookSubscriptionRequest,
	UpdateWebhookSubscriptionRequest,
	WebhookDeliveryListResponse,
	WebhookDlqListResponse
} from './types';

export interface ListWebhookSubscriptionsParams {
	limit?: number;
	offset?: number;
}

export interface ListWebhookDeliveriesParams {
	limit?: number;
	offset?: number;
}

export interface ListDlqEntriesParams {
	limit?: number;
	offset?: number;
}

function buildSearchParams(params: Record<string, string | number | boolean | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

export async function listWebhookEventTypes(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<WebhookEventTypeListResponse> {
	return apiClient<WebhookEventTypeListResponse>('/webhooks/event-types', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listWebhookSubscriptions(
	params: ListWebhookSubscriptionsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<WebhookSubscriptionListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<WebhookSubscriptionListResponse>(`/webhooks/subscriptions${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createWebhookSubscription(
	data: CreateWebhookSubscriptionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<WebhookSubscription> {
	return apiClient<WebhookSubscription>('/webhooks/subscriptions', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getWebhookSubscription(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<WebhookSubscription> {
	return apiClient<WebhookSubscription>(`/webhooks/subscriptions/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateWebhookSubscription(
	id: string,
	data: UpdateWebhookSubscriptionRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<WebhookSubscription> {
	return apiClient<WebhookSubscription>(`/webhooks/subscriptions/${id}`, {
		method: 'PATCH',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteWebhookSubscription(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/webhooks/subscriptions/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listWebhookDeliveries(
	subscriptionId: string,
	params: ListWebhookDeliveriesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<WebhookDeliveryListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<WebhookDeliveryListResponse>(
		`/webhooks/subscriptions/${subscriptionId}/deliveries${qs}`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function listDlqEntries(
	params: ListDlqEntriesParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<WebhookDlqListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<WebhookDlqListResponse>(`/webhooks/dlq${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function replayDlqEntry(
	entryId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/webhooks/dlq/${entryId}/replay`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteDlqEntry(
	entryId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/webhooks/dlq/${entryId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
