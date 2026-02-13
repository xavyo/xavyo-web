import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listMetaRoles } from '$lib/api/meta-roles';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const status = url.searchParams.get('status') || undefined;
	const name = url.searchParams.get('name') || undefined;

	let metaRoles = { items: [] as any[], total: 0, limit, offset };
	try {
		metaRoles = await listMetaRoles(
			{ status, name, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
	} catch {
		// Show empty state on error
	}

	return { metaRoles };
};
