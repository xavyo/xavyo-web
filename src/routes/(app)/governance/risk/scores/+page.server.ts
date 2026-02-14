import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listRiskScores } from '$lib/api/risk';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const risk_level = url.searchParams.get('risk_level') ?? undefined;
	const min_score = url.searchParams.get('min_score')
		? Number(url.searchParams.get('min_score'))
		: undefined;
	const max_score = url.searchParams.get('max_score')
		? Number(url.searchParams.get('max_score'))
		: undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const scores = await listRiskScores(
		{ risk_level, min_score, max_score, sort_by: 'score_desc', limit, offset },
		locals.accessToken!,
		locals.tenantId!,
		fetch
	).catch(() => ({ items: [], total: 0, limit, offset }));

	return { scores, filters: { risk_level, min_score, max_score } };
};
