import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { isHttpError } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listImportJobs, uploadImport } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const status = url.searchParams.get('status') ?? undefined;

	try {
		const result = await listImportJobs(
			{ status, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { jobs: result.items, total: result.total, limit, offset };
	} catch {
		return { jobs: [], total: 0, limit, offset };
	}
};

export const actions: Actions = {
	upload: async ({ request, locals, fetch }) => {
		if (!hasAdminRole(locals.user?.roles)) {
			return fail(403, { error: 'Forbidden' });
		}

		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const sendInvitations = formData.get('send_invitations') === 'on';

		if (!file || !(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Please select a CSV file to upload' });
		}

		if (!file.name.endsWith('.csv')) {
			return fail(400, { error: 'Only CSV files are supported' });
		}

		try {
			await uploadImport(
				file,
				sendInvitations,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				if (e.status === 409) {
					return fail(409, { error: 'A concurrent import is already in progress' });
				}
				if (e.status === 413) {
					return fail(413, { error: 'File is too large. Maximum size is 10 MB.' });
				}
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred during upload' });
		}

		redirect(303, '/settings/imports');
	}
};
