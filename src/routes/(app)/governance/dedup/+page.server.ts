import type { PageServerLoad, Actions } from './$types';
import { error, isHttpError } from '@sveltejs/kit';
import { listDuplicates, detectDuplicates } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { runDetectionSchema } from '$lib/schemas/dedup';
import type { ErrorStatus } from 'sveltekit-superforms';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {

	const status = url.searchParams.get('status') ?? undefined;
	const min_confidence = finiteNumber(url.searchParams.get('min_confidence'));
	const { limit = 50, offset = 0 } = listPagination(url);

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
