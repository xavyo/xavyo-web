import { describe, it, expect } from 'vitest';
import { applyOAuthAdvertisedFields, type OAuthAdvertisedFields } from './oauth-client-fields';

describe('applyOAuthAdvertisedFields', () => {
	it('copies advertised security and profile fields', () => {
		const data: OAuthAdvertisedFields = {};
		applyOAuthAdvertisedFields(
			{
				post_logout_redirect_uris: ['https://ex/logout'],
				nhi_id: '11111111-1111-1111-1111-111111111111',
				require_dpop: true,
				fapi_profile: true,
				jwks: { keys: [] },
				tls_client_cert_thumbprint: 'thumb'
			},
			data
		);
		expect(data).toEqual({
			post_logout_redirect_uris: ['https://ex/logout'],
			nhi_id: '11111111-1111-1111-1111-111111111111',
			require_dpop: true,
			fapi_profile: true,
			jwks: { keys: [] },
			tls_client_cert_thumbprint: 'thumb'
		});
	});

	it('rejects non-object jwks', () => {
		expect(() => applyOAuthAdvertisedFields({ jwks: [] }, {})).toThrow();
	});
});
