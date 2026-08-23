import type { Actions, PageServerLoad } from './$types';
import { apiClient } from '$lib/api/client';
import { requestTenantId } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url }) => {
	return {
		email: url.searchParams.get('email') ?? ''
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
			const tenantId = requestTenantId(url, cookies);
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
