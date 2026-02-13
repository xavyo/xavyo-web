import type {
	WebhookEventTypeListResponse,
	WebhookSubscriptionListResponse,
	WebhookDeliveryListResponse,
	WebhookDlqListResponse
} from './types';

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

export async function fetchWebhookEventTypes(
	fetchFn: typeof fetch = fetch
): Promise<WebhookEventTypeListResponse> {
	const res = await fetchFn('/api/admin/webhooks/event-types');
	if (!res.ok) throw new Error(`Failed to fetch webhook event types: ${res.status}`);
	return res.json();
}

export async function fetchWebhookSubscriptions(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<WebhookSubscriptionListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/admin/webhooks/subscriptions${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch webhook subscriptions: ${res.status}`);
	return res.json();
}

export async function fetchWebhookDeliveries(
	subscriptionId: string,
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<WebhookDeliveryListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/admin/webhooks/subscriptions/${subscriptionId}/deliveries${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch webhook deliveries: ${res.status}`);
	return res.json();
}

export async function fetchDlqEntries(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<WebhookDlqListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/admin/webhooks/dlq${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch DLQ entries: ${res.status}`);
	return res.json();
}

export async function replayDlqEntryClient(
	entryId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/admin/webhooks/dlq/${entryId}/replay`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to replay DLQ entry: ${res.status}`);
}

export async function deleteDlqEntryClient(
	entryId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/admin/webhooks/dlq/${entryId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete DLQ entry: ${res.status}`);
}
