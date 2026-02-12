import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createPeerGroupSchema } from '$lib/schemas/peer-groups';
import { createPeerGroup } from '$lib/api/peer-groups';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createPeerGroupSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}

		const form = await superValidate(request, zod(createPeerGroupSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await createPeerGroup(form.data, locals.accessToken, locals.tenantId, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/peer-groups');
	}
};
