import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bulkAssignLicenses } from '$lib/api/licenses';
import type { BulkAssignLicenseRequest, LicenseAssignmentSource } from '$lib/api/types';
import { ApiError } from '$lib/api/client';

const ASSIGNMENT_SOURCES = ['manual', 'automatic', 'entitlement'] as const;

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		if (typeof body.license_pool_id !== 'string' || body.license_pool_id.length === 0) {
			return json({ error: 'license_pool_id is required' }, { status: 400 });
		}
		if (
			!Array.isArray(body.user_ids) ||
			body.user_ids.length === 0 ||
			body.user_ids.some((id) => typeof id !== 'string' || id.length === 0)
		) {
			return json({ error: 'user_ids is required' }, { status: 400 });
		}
		const data: BulkAssignLicenseRequest = {
			license_pool_id: body.license_pool_id,
			user_ids: body.user_ids as string[]
		};
		if (body.source !== undefined) {
			if (!ASSIGNMENT_SOURCES.includes(body.source as (typeof ASSIGNMENT_SOURCES)[number])) {
				return json({ error: 'source is required' }, { status: 400 });
			}
			data.source = body.source as LicenseAssignmentSource;
		}
		const result = await bulkAssignLicenses(data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to bulk assign licenses' }, { status: 500 });
	}
};
