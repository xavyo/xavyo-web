import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listObjectTemplates } from '$lib/api/object-templates';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const object_type = url.searchParams.get('object_type') || undefined;
	const status = url.searchParams.get('status') || undefined;
	const offset = Number(url.searchParams.get('offset') || '0');
	const limit = Number(url.searchParams.get('limit') || '20');

	try {
		const result = await listObjectTemplates(
			{ object_type, status, offset, limit },
			locals.accessToken!,
			locals.tenantId!
		);
		return {
			templates: result.items,
			total: result.total,
			offset,
			limit,
			filters: { object_type: object_type || '', status: status || '' }
		};
	} catch {
		return {
			templates: [],
			total: 0,
			offset: 0,
			limit: 20,
			filters: { object_type: '', status: '' }
		};
	}
};
