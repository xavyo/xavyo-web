import type { PageServerLoad } from './$types';
import { listA2aTasks } from '$lib/api/a2a';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const state = url.searchParams.get('state') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listA2aTasks(
			{ state, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { tasks: result.tasks, total: result.total, limit, offset, state };
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load A2A tasks');
	}
};
