import type { PageServerLoad } from './$types';
import { getGdprReport } from '$lib/api/gdpr';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	try {
		const report = await getGdprReport(locals.accessToken!, locals.tenantId!, fetch);
		return { report };
	} catch (e) {
		if (e instanceof ApiError && e.status === 404) {
			return { report: null };
		}
		throw e;
	}
};
