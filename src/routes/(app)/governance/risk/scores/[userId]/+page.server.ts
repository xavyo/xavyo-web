import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getUserRiskScore } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	try {
		const score = await getUserRiskScore(
			params.userId,
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { score, userId: params.userId };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load risk score');
	}
};
