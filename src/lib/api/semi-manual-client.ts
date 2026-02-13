import type {
	SemiManualApplication,
	SemiManualApplicationListResponse,
	ConfigureSemiManualRequest
} from './types';

function buildSearchParams(params: Record<string, string | number | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

export async function fetchSemiManualApplications(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<SemiManualApplicationListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/governance/semi-manual/applications${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch semi-manual applications: ${res.status}`);
	return res.json();
}

export async function configureSemiManualClient(
	id: string,
	data: ConfigureSemiManualRequest,
	fetchFn: typeof fetch = fetch
): Promise<SemiManualApplication> {
	const res = await fetchFn(`/api/governance/semi-manual/applications/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to configure semi-manual application: ${res.status}`);
	return res.json();
}

export async function removeSemiManualConfigClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<SemiManualApplication> {
	const res = await fetchFn(`/api/governance/semi-manual/applications/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove semi-manual configuration: ${res.status}`);
	return res.json();
}
