import type { PageServerLoad } from './$types';
import { error, isHttpError } from '@sveltejs/kit';
import { getMergeAudit } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {

	try {
		const audit = await getMergeAudit(params.id, locals.accessToken!, locals.tenantId!, fetch);
		return { audit };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			if (e.status === 404) {
				error(404, 'Audit record not found');
			}
			error(e.status, e.message);
		}
		error(500, 'Failed to load audit detail');
	}
};
