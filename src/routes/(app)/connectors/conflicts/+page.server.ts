import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listConflicts } from '$lib/api/operations';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const conflict_type = url.searchParams.get('conflict_type') ?? undefined;
	const pending_only = url.searchParams.get('pending_only') === 'true' ? true : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listConflicts(
			{ conflict_type, pending_only, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { conflicts: result };
	} catch {
		return { conflicts: { conflicts: [], total: 0, limit, offset } };
	}
};
