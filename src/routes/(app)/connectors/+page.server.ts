import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listConnectors } from '$lib/api/connectors';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const name_contains = url.searchParams.get('name_contains') ?? undefined;
	const connector_type = url.searchParams.get('connector_type') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listConnectors(
			{ name_contains, connector_type, status, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { connectors: result };
	} catch {
		return { connectors: { items: [], total: 0, limit, offset } };
	}
};
