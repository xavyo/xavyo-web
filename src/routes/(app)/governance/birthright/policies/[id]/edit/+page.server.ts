import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { createBirthrightPolicySchema, updateBirthrightPolicySchema } from '$lib/schemas/birthright';
import { getBirthrightPolicy, updateBirthrightPolicy } from '$lib/api/birthright';
import { listEntitlements } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { UpdateBirthrightPolicyRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) redirect(302, '/dashboard');

	const [policy, entitlementResult] = await Promise.all([
		getBirthrightPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch),
		listEntitlements(
			{ status: 'active', limit: 100 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		).catch(() => ({ items: [] }))
	]);

	const form = await superValidate(
		{
			name: policy.name,
			description: policy.description ?? undefined,
			priority: policy.priority,
			evaluation_mode: policy.evaluation_mode,
			grace_period_days: policy.grace_period_days
		},
		zod(createBirthrightPolicySchema)
	);

	const entitlements = entitlementResult.items.map((e: any) => ({ id: e.id, name: e.name }));

	return { form, policy, entitlements };
};

export const actions: Actions = {
	default: async ({ params, request, locals, fetch }) => {
		const formData = await request.formData();
		const conditionsJson = formData.get('conditions_json') as string;
		const entitlementIdsJson = formData.get('entitlement_ids_json') as string;

		let conditions: unknown[] = [];
		let entitlement_ids: string[] = [];
		try {
			conditions = JSON.parse(conditionsJson || '[]');
			entitlement_ids = JSON.parse(entitlementIdsJson || '[]');
		} catch {
			/* will fail validation */
		}

		const rawData = {
			name: formData.get('name') as string,
			description: (formData.get('description') as string) || undefined,
			priority: formData.get('priority') as string,
			evaluation_mode: formData.get('evaluation_mode') as string,
			grace_period_days: formData.get('grace_period_days') as string,
			conditions,
			entitlement_ids
		};

		const form = await superValidate(rawData as Record<string, unknown>, zod(updateBirthrightPolicySchema));
		if (!form.valid) return fail(400, { form });

		const body: UpdateBirthrightPolicyRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			priority: form.data.priority,
			conditions: form.data.conditions as UpdateBirthrightPolicyRequest['conditions'],
			entitlement_ids: form.data.entitlement_ids,
			evaluation_mode: form.data.evaluation_mode,
			grace_period_days: form.data.grace_period_days
		};

		try {
			await updateBirthrightPolicy(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
			redirect(302, `/governance/birthright/policies/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return message(form, e.message, { status: e.status as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
	}
};
