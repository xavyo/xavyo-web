import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listRiskScores } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const risk_level = url.searchParams.get('risk_level') ?? undefined;
	const min_score = finiteNumber(url.searchParams.get('min_score'));
	const max_score = finiteNumber(url.searchParams.get('max_score'));
	const { limit = 50, offset = 0 } = listPagination(url);

	try {
		const scores = await listRiskScores(
			{ risk_level, min_score, max_score, sort_by: 'score_desc', limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { scores, filters: { risk_level, min_score, max_score } };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load risk scores');
	}
};
