import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLicenseAssignments, createLicenseAssignment } from '$lib/api/licenses';
import type { AssignLicenseRequest, LicenseAssignmentSource } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const ASSIGNMENT_SOURCES = ['manual', 'automatic', 'entitlement'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const license_pool_id = url.searchParams.get('license_pool_id');
	const user_id = url.searchParams.get('user_id');
	const status = url.searchParams.get('status');
	const source = url.searchParams.get('source');
	const limit = url.searchParams.get('limit');
	const offset = url.searchParams.get('offset');

	try {
		const result = await listLicenseAssignments(
			{
				license_pool_id: license_pool_id ?? undefined,
				user_id: user_id ?? undefined,
				status: status ?? undefined,
				source: source ?? undefined,
				limit: limit ? parseInt(limit, 10) : undefined,
				offset: offset ? parseInt(offset, 10) : undefined
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list license assignments' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
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
		if (typeof body.user_id !== 'string' || body.user_id.length === 0) {
			return json({ error: 'user_id is required' }, { status: 400 });
		}
		const data: AssignLicenseRequest = {
			license_pool_id: body.license_pool_id,
			user_id: body.user_id
		};
		if (body.source !== undefined) {
			if (!ASSIGNMENT_SOURCES.includes(body.source as (typeof ASSIGNMENT_SOURCES)[number])) {
				return json({ error: 'source is required' }, { status: 400 });
			}
			data.source = body.source as LicenseAssignmentSource;
		}
		if (body.notes !== undefined) {
			if (typeof body.notes !== 'string') {
				return json({ error: 'notes must be a string' }, { status: 400 });
			}
			data.notes = body.notes;
		}
		const result = await createLicenseAssignment(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create license assignment' }, { status: 500 });
	}
};
