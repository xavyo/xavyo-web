import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listUserRiskEvents } from '$lib/api/risk';

export const load: PageServerLoad = async ({ params, url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const event_type = url.searchParams.get('event_type') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const events = await listUserRiskEvents(
		params.userId,
		{ event_type, limit, offset },
		locals.accessToken!,
		locals.tenantId!,
		fetch
	).catch(() => ({ items: [], total: 0, limit, offset }));

	return { events, userId: params.userId, filters: { event_type } };
};
