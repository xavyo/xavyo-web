import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getNhiOverallSummary } from '$lib/api/nhi-usage';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const summary = await getNhiOverallSummary(locals.accessToken, locals.tenantId, fetch);
		return { summary };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load NHI summary');
	}
};
