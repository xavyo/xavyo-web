import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createGroupSchema } from '$lib/schemas/approval-workflows';
import { createApprovalGroup } from '$lib/api/approval-workflows';
import { ApiError } from '$lib/api/client';
import type { CreateApprovalGroupRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createGroupSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createGroupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateApprovalGroupRequest = {
			name: form.data.name,
			description: form.data.description || undefined
		};

		let groupId: string;
		try {
			const group = await createApprovalGroup(
				body,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			groupId = group.id;
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, `/governance/approval-config/groups/${groupId}`);
	}
};
