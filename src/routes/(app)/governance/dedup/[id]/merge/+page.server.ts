import type { PageServerLoad, Actions } from './$types';
import { error, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import { getDuplicate, previewMerge, executeMerge } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { mergeExecuteSchema } from '$lib/schemas/dedup';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const duplicate = await getDuplicate(params.id, locals.accessToken!, locals.tenantId!, fetch);

		const preview = await previewMerge(
			{
				source_identity_id: duplicate.identity_a_id,
				target_identity_id: duplicate.identity_b_id,
				entitlement_strategy: 'union'
			},
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);

		const mergeForm = await superValidate(
			{
				source_identity_id: duplicate.identity_a_id,
				target_identity_id: duplicate.identity_b_id,
				entitlement_strategy: 'union'
			},
			zod(mergeExecuteSchema)
		);

		return { duplicate, preview, mergeForm };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			if (e.status === 404) {
				error(404, 'Duplicate not found');
			}
			error(e.status, e.message);
		}
		error(500, 'Failed to load merge preview');
	}
};

export const actions = {
	execute: async ({ request, locals, fetch }) => {
		if (!hasAdminRole(locals.user?.roles)) {
			redirect(302, '/dashboard');
		}

		const form = await superValidate(request, zod(mergeExecuteSchema));
		if (!form.valid) {
			return message(form, 'Invalid merge parameters', { status: 400 as ErrorStatus });
		}

		try {
			// Parse attribute_selections from JSON string
			const attributeSelections = form.data.attribute_selections
				? (JSON.parse(form.data.attribute_selections) as Record<string, { source: 'source' | 'target' }>)
				: undefined;

			// Parse entitlement_selections from JSON string
			const entitlementSelections = form.data.entitlement_selections
				? (JSON.parse(form.data.entitlement_selections) as string[])
				: null;

			await executeMerge(
				{
					source_identity_id: form.data.source_identity_id,
					target_identity_id: form.data.target_identity_id,
					entitlement_strategy: form.data.entitlement_strategy,
					attribute_selections: attributeSelections,
					entitlement_selections: entitlementSelections,
					sod_override_reason: form.data.sod_override_reason || null
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);

			redirect(302, '/governance/dedup');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof SyntaxError) {
				return message(form, 'Invalid selection data', { status: 400 as ErrorStatus });
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Failed to execute merge', { status: 500 as ErrorStatus });
		}
	}
} satisfies Actions;
