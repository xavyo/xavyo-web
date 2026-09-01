import { error } from '@sveltejs/kit';

export type OAuthAdvertisedFields = {
	post_logout_redirect_uris?: string[];
	nhi_id?: string;
	require_dpop?: boolean;
	fapi_profile?: boolean;
	jwks?: Record<string, unknown>;
	tls_client_cert_thumbprint?: string;
};

function stringArray(value: unknown, field: string): string[] {
	if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
		error(400, `${field} must be an array of strings`);
	}
	return value;
}

/** Copy advertised OAuth client security/profile fields from a BFF JSON body. */
export function applyOAuthAdvertisedFields(
	body: Record<string, unknown>,
	data: OAuthAdvertisedFields
): void {
	if (body.post_logout_redirect_uris !== undefined) {
		data.post_logout_redirect_uris = stringArray(
			body.post_logout_redirect_uris,
			'post_logout_redirect_uris'
		);
	}
	if (body.nhi_id !== undefined) {
		if (typeof body.nhi_id !== 'string') {
			error(400, 'nhi_id must be a string');
		}
		data.nhi_id = body.nhi_id;
	}
	if (body.require_dpop !== undefined) {
		if (typeof body.require_dpop !== 'boolean') {
			error(400, 'require_dpop must be a boolean');
		}
		data.require_dpop = body.require_dpop;
	}
	if (body.fapi_profile !== undefined) {
		if (typeof body.fapi_profile !== 'boolean') {
			error(400, 'fapi_profile must be a boolean');
		}
		data.fapi_profile = body.fapi_profile;
	}
	if (body.jwks !== undefined) {
		if (!body.jwks || typeof body.jwks !== 'object' || Array.isArray(body.jwks)) {
			error(400, 'jwks must be an object');
		}
		data.jwks = body.jwks as Record<string, unknown>;
	}
	if (body.tls_client_cert_thumbprint !== undefined) {
		if (typeof body.tls_client_cert_thumbprint !== 'string') {
			error(400, 'tls_client_cert_thumbprint must be a string');
		}
		data.tls_client_cert_thumbprint = body.tls_client_cert_thumbprint;
	}
}
