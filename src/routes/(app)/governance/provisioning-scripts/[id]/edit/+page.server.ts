import { redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { ErrorStatus } from 'sveltekit-superforms';
import { updateProvisioningScriptSchema } from '$lib/schemas/provisioning-scripts';
import { hasAdminRole } from '$lib/server/auth';
import { getProvisioningScript, updateProvisioningScript } from '$lib/api/provisioning-scripts';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { accessToken, tenantId, user } = locals;
	if (!accessToken || !tenantId) throw redirect(302, '/login');
	if (!hasAdminRole(user?.roles ?? [])) throw redirect(302, '/');

	const script = await getProvisioningScript(params.id, accessToken, tenantId);
	const form = await superValidate(
		{ name: script.name, description: script.description ?? '' },
		zod(updateProvisioningScriptSchema)
	);
	return { form, script };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const { accessToken, tenantId } = locals;
		if (!accessToken || !tenantId) throw redirect(302, '/login');

		const form = await superValidate(request, zod(updateProvisioningScriptSchema));
		if (!form.valid) return message(form, 'Please fix the errors below', { status: 400 as ErrorStatus });

		try {
			await updateProvisioningScript(
				params.id,
				{
					name: form.data.name,
					description: form.data.description || undefined
				},
				accessToken,
				tenantId
			);
			throw redirect(302, `/governance/provisioning-scripts/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) return message(form, e.body?.message || 'Failed to update script', { status: e.status as ErrorStatus });
			if (e instanceof ApiError) return message(form, e.message, { status: (e.status || 500) as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}
	}
};
