import { env } from '$env/dynamic/private';

export class ApiError extends Error {
	status: number;
	errorType: string;

	constructor(message: string, status: number, errorType?: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.errorType = errorType ?? '';
	}
}

interface ApiClientOptions {
	method: string;
	body?: unknown;
	token?: string;
	tenantId?: string;
	fetch?: typeof globalThis.fetch;
}

export async function apiClient<T>(endpoint: string, options: ApiClientOptions): Promise<T> {
	const { method, body, token, tenantId, fetch: fetchFn = globalThis.fetch } = options;

	const headers = new Headers();
	headers.set('Content-Type', 'application/json');

	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	if (tenantId) {
		headers.set('X-Tenant-Id', tenantId);
	}

	const baseUrl = env.API_BASE_URL;
	const url = `${baseUrl}${endpoint}`;

	const response = await fetchFn(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined
	});

	if (response.status === 204) {
		return null as T;
	}

	if (!response.ok) {
		let errorMessage = 'An error occurred';
		let errorType = '';
		try {
			const text = await response.text();
			try {
				const errorBody = JSON.parse(text);
				errorMessage = errorBody.message || errorBody.detail || errorBody.error || errorMessage;
				errorType = errorBody.type ?? '';
			} catch {
				// Response body not JSON — use plain text if available
				if (text) {
					errorMessage = text;
				}
			}
		} catch {
			// Could not read response body
		}
		throw new ApiError(errorMessage, response.status, errorType);
	}

	// Handle empty 200 responses (e.g. DELETE returning 200 with no body)
	const text = await response.text();
	if (!text) {
		return null as T;
	}

	return JSON.parse(text) as T;
}
