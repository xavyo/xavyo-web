import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listScimTargets } from '$lib/api/scim-targets';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listScimTargets(
			{ status, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { targets: result };
	} catch {
		return { targets: { items: [], total: 0, limit, offset } };
	}
};
