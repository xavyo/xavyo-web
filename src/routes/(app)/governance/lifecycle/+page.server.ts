import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listLifecycleConfigs } from '$lib/api/lifecycle';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const object_type = url.searchParams.get('object_type') ?? undefined;
	const is_active_raw = url.searchParams.get('is_active');
	const is_active = is_active_raw !== null ? is_active_raw === 'true' : undefined;

	try {
		const configs = await listLifecycleConfigs(
			{ object_type, is_active, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { configs, filters: { object_type, is_active } };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load lifecycle configs');
	}
};
