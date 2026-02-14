import type { Actions, PageServerLoad } from './$types';
import { SYSTEM_TENANT_ID } from '$lib/server/auth';
import { apiClient } from '$lib/api/client';

export const load: PageServerLoad = async ({ url }) => {
	return {
		email: url.searchParams.get('email') ?? ''
	};
};

export const actions: Actions = {
	resend: async ({ request, fetch }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return { success: false, error: 'Email is required' };
		}

		try {
			await apiClient('/auth/resend-verification', {
				method: 'POST',
				body: { email },
				tenantId: SYSTEM_TENANT_ID,
				fetch
			});
			return { success: true };
		} catch {
			// Always show success to prevent email enumeration
			return { success: true };
		}
	}
};
