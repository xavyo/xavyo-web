import type {
	SwitchContextRequest,
	SwitchBackRequest,
	SwitchContextResponse,
	CurrentContextResponse,
	ContextSessionListResponse
} from './types';

export async function switchContextClient(
	body: SwitchContextRequest,
	fetchFn: typeof fetch = fetch
): Promise<SwitchContextResponse> {
	const res = await fetchFn('/api/personas/context/switch', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to switch context: ${res.status}`);
	return res.json();
}

export async function switchBackClient(
	body: SwitchBackRequest = {},
	fetchFn: typeof fetch = fetch
): Promise<SwitchContextResponse> {
	const res = await fetchFn('/api/personas/context/switch-back', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Failed to switch back: ${res.status}`);
	return res.json();
}

export async function fetchCurrentContext(
	fetchFn: typeof fetch = fetch
): Promise<CurrentContextResponse> {
	const res = await fetchFn('/api/personas/context/current');
	if (!res.ok) throw new Error(`Failed to fetch current context: ${res.status}`);
	return res.json();
}

export async function fetchContextSessions(
	params: { limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<ContextSessionListResponse> {
	const searchParams = new URLSearchParams();
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const res = await fetchFn(`/api/personas/context/sessions${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to fetch context sessions: ${res.status}`);
	return res.json();
}
