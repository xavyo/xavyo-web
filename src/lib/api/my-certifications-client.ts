import type {
	MyCertificationListResponse,
	MyCertificationItem
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

export async function fetchMyCertifications(
	params: { campaign_id?: string; status?: string; page?: number; page_size?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<MyCertificationListResponse> {
	const qs = buildSearchParams({
		campaign_id: params.campaign_id,
		status: params.status,
		page: params.page,
		page_size: params.page_size
	});
	const res = await fetchFn(`/api/governance/my-certifications${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch my certifications: ${res.status}`);
	return res.json();
}

export async function certifyItemClient(
	itemId: string,
	fetchFn: typeof fetch = fetch
): Promise<MyCertificationItem> {
	const res = await fetchFn(`/api/governance/my-certifications/${itemId}/certify`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to certify item: ${res.status}`);
	return res.json();
}

export async function revokeItemClient(
	itemId: string,
	fetchFn: typeof fetch = fetch
): Promise<MyCertificationItem> {
	const res = await fetchFn(`/api/governance/my-certifications/${itemId}/revoke`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to revoke item: ${res.status}`);
	return res.json();
}
