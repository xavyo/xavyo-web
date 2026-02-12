import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { isHttpError } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getImportJob, listImportErrors, resendInvitations } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const errorLimit = Number(url.searchParams.get('elimit') ?? '20');
	const errorOffset = Number(url.searchParams.get('eoffset') ?? '0');

	let job;
	let errors;
	let errorTotal = 0;

	try {
		[job, errors] = await Promise.all([
			getImportJob(params.id, locals.accessToken!, locals.tenantId!, fetch),
			listImportErrors(
				params.id,
				{ limit: errorLimit, offset: errorOffset },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch(() => ({ items: [], total: 0, limit: errorLimit, offset: errorOffset }))
		]);
		errorTotal = errors.total;
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load import job');
	}

	return {
		job,
		errors: errors.items,
		errorTotal,
		errorLimit,
		errorOffset
	};
};

export const actions: Actions = {
	resend: async ({ params, locals, fetch }) => {
		if (!hasAdminRole(locals.user?.roles)) {
			return fail(403, { error: 'Forbidden' });
		}

		try {
			const result = await resendInvitations(
				params.id,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return {
				success: true,
				action: 'resend',
				resent_count: result.resent_count,
				skipped_count: result.skipped_count,
				message: result.message
			};
		} catch (e) {
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to resend invitations' });
		}
	}
};
