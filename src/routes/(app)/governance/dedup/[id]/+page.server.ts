import type { PageServerLoad, Actions } from './$types';
import { error, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import { getDuplicate, dismissDuplicate } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dismissDuplicateSchema } from '$lib/schemas/dedup';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const duplicate = await getDuplicate(params.id, locals.accessToken!, locals.tenantId!, fetch);
		const dismissForm = await superValidate(zod(dismissDuplicateSchema));

		return { duplicate, dismissForm };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			if (e.status === 404) {
				error(404, 'Duplicate not found');
			}
			error(e.status, e.message);
		}
		error(500, 'Failed to load duplicate detail');
	}
};

export const actions = {
	dismiss: async ({ params, request, locals, fetch }) => {
		if (!hasAdminRole(locals.user?.roles)) {
			redirect(302, '/dashboard');
		}

		const form = await superValidate(request, zod(dismissDuplicateSchema));
		if (!form.valid) {
			return message(form, 'Reason is required', { status: 400 as ErrorStatus });
		}

		try {
			await dismissDuplicate(
				params.id,
				form.data.reason,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			redirect(302, '/governance/dedup');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Failed to dismiss duplicate', { status: 500 as ErrorStatus });
		}
	}
} satisfies Actions;
