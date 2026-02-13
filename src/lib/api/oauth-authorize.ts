import { apiClient } from '$lib/api/client';

export interface AuthorizeInfo {
	client_name: string;
	client_id: string;
	scopes: string[];
	redirect_uri: string;
}

export interface AuthorizeGrantResponse {
	authorization_code: string;
	state: string;
	redirect_uri: string;
}

export async function getAuthorizeInfo(
	params: {
		client_id: string;
		redirect_uri: string;
		scope: string;
	},
	token: string,
	tenantId: string,
	fetchFn: typeof fetch
): Promise<AuthorizeInfo> {
	const query = new URLSearchParams({
		client_id: params.client_id,
		redirect_uri: params.redirect_uri,
		scope: params.scope
	}).toString();

	return apiClient<AuthorizeInfo>(`/oauth/authorize/info?${query}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function grantAuthorizationCode(
	data: {
		client_id: string;
		redirect_uri: string;
		scope: string;
		state: string;
		code_challenge: string;
		code_challenge_method: string;
		nonce?: string;
	},
	token: string,
	tenantId: string,
	fetchFn: typeof fetch
): Promise<AuthorizeGrantResponse> {
	return apiClient<AuthorizeGrantResponse>('/oauth/authorize/grant', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}
