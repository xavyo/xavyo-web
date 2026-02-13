import type { PageServerLoad, Actions } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { listDuplicates, detectDuplicates } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { runDetectionSchema } from '$lib/schemas/dedup';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const min_confidence = url.searchParams.get('min_confidence')
		? Number(url.searchParams.get('min_confidence'))
		: undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const duplicates = await listDuplicates(
			{
				status: status as 'pending' | 'merged' | 'dismissed' | undefined,
				min_confidence,
				limit,
				offset
			},
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);

		const detectForm = await superValidate(zod(runDetectionSchema));

		return { duplicates, detectForm };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load duplicates');
	}
};

export const actions = {
	detect: async ({ request, locals, fetch }) => {
		if (!hasAdminRole(locals.user?.roles)) {
			redirect(302, '/dashboard');
		}

		const form = await superValidate(request, zod(runDetectionSchema));
		if (!form.valid) {
			return message(form, 'Invalid parameters', { status: 400 as ErrorStatus });
		}

		try {
			const result = await detectDuplicates(
				form.data.min_confidence,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return message(form, `Scan complete: ${result.duplicates_found} duplicates found (${result.new_duplicates} new)`);
		} catch (e) {
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Failed to run detection scan', { status: 500 as ErrorStatus });
		}
	}
} satisfies Actions;
