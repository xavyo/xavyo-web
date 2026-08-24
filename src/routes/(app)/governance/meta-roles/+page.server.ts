import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listMetaRoles } from '$lib/api/meta-roles';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const status = url.searchParams.get('status') || undefined;
	const name = url.searchParams.get('name') || undefined;

	try {
		const metaRoles = await listMetaRoles(
			{ status, name, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { metaRoles };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load meta-roles');
	}
};
