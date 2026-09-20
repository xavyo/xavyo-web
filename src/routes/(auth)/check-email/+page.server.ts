import type { Actions, PageServerLoad } from './$types';
import { apiClient } from '$lib/api/client';
import {
	requestTenantId,
	stampTenantCookieFromQuery,
	tenantIdFromQuery
} from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, cookies }) => {
	stampTenantCookieFromQuery(cookies, url);

	const sentParam = url.searchParams.get('sent');
	// Absent `sent` (e.g. login → check-email): do not alarm; only signup sets sent=0.
	const verificationEmailSent =
		sentParam === null || sentParam === ''
			? true
			: sentParam !== '0' && sentParam.toLowerCase() !== 'false';

	const tenant =
		tenantIdFromQuery(url.searchParams.get('tenant')) || cookies.get('tenant_id') || '';

	return {
		email: url.searchParams.get('email') ?? '',
		tenant,
		verificationEmailSent
	};
};

export const actions: Actions = {
	resend: async ({ request, cookies, fetch, url }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return { success: false, error: 'Email is required' };
		}

		try {
			const formTenant = tenantIdFromQuery(String(formData.get('tenant') ?? ''));
			const tenantId = formTenant || requestTenantId(url, cookies);
			await apiClient('/auth/resend-verification', {
				method: 'POST',
				body: { email },
				...(tenantId ? { tenantId } : {}),
				fetch
			});
			return { success: true };
		} catch {
			// Always show success to prevent email enumeration
			return { success: true };
		}
	}
};
