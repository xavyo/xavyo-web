import type { PageServerLoad } from './$types';
import { getNhiOverallSummary } from '$lib/api/nhi-usage';
import type { NhiOverallSummary } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	let summary: NhiOverallSummary | null = null;
	try {
		summary = await getNhiOverallSummary(locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// Non-critical, summary cards will be hidden
	}

	return { summary };
};
