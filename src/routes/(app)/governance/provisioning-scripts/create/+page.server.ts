import { redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { ErrorStatus } from 'sveltekit-superforms';
import { createProvisioningScriptSchema } from '$lib/schemas/provisioning-scripts';
import { hasAdminRole } from '$lib/server/auth';
import { createProvisioningScript } from '$lib/api/provisioning-scripts';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals }) => {
	const { accessToken, tenantId, user } = locals;
	if (!accessToken || !tenantId) throw redirect(302, '/login');
	if (!hasAdminRole(user?.roles ?? [])) throw redirect(302, '/');

	const form = await superValidate(zod(createProvisioningScriptSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { accessToken, tenantId } = locals;
		if (!accessToken || !tenantId) throw redirect(302, '/login');

		const form = await superValidate(request, zod(createProvisioningScriptSchema));
		if (!form.valid) return message(form, 'Please fix the errors below', { status: 400 as ErrorStatus });

		try {
			const result = await createProvisioningScript(
				{
					name: form.data.name,
					description: form.data.description || undefined
				},
				accessToken,
				tenantId
			);
			throw redirect(302, `/governance/provisioning-scripts/${result.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) return message(form, e.body?.message || 'Failed to create script', { status: e.status as ErrorStatus });
			if (e instanceof ApiError) return message(form, e.message, { status: (e.status || 500) as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}
	}
};
