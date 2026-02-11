import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createNhiCertCampaignSchema } from '$lib/schemas/nhi-governance';
import { createNhiCertCampaign } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import type { CreateNhiCertCampaignRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createNhiCertCampaignSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createNhiCertCampaignSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateNhiCertCampaignRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			scope: form.data.scope || undefined,
			nhi_type_filter: form.data.nhi_type_filter || undefined,
			due_date: form.data.due_date ? (form.data.due_date.includes('T') ? form.data.due_date : `${form.data.due_date}T23:59:59Z`) : undefined
		};

		try {
			await createNhiCertCampaign(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/nhi/governance');
	}
};
