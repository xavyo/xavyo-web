import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listScimTargetMappings, replaceScimTargetMappings } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';
import type { ScimReplaceMappingsRequest, ScimTargetMappingEntry } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const resource_type = url.searchParams.get('resource_type') ?? undefined;

	try {
		const result = await listScimTargetMappings(params.id, { resource_type }, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to fetch mappings' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
		if (!Array.isArray(body.mappings)) {
			return json({ error: 'mappings is required' }, { status: 400 });
		}
		const mappings: ScimTargetMappingEntry[] = [];
		for (const item of body.mappings) {
			if (!item || typeof item !== 'object' || Array.isArray(item)) {
				return json({ error: 'each mapping must be an object' }, { status: 400 });
			}
			const entry = item as Record<string, unknown>;
			if (typeof entry.source_field !== 'string' || entry.source_field.length === 0) {
				return json({ error: 'source_field is required' }, { status: 400 });
			}
			if (typeof entry.target_scim_path !== 'string' || entry.target_scim_path.length === 0) {
				return json({ error: 'target_scim_path is required' }, { status: 400 });
			}
			if (typeof entry.mapping_type !== 'string' || entry.mapping_type.length === 0) {
				return json({ error: 'mapping_type is required' }, { status: 400 });
			}
			if (typeof entry.resource_type !== 'string' || entry.resource_type.length === 0) {
				return json({ error: 'resource_type is required' }, { status: 400 });
			}
			const mapped: ScimTargetMappingEntry = {
				source_field: entry.source_field,
				target_scim_path: entry.target_scim_path,
				mapping_type: entry.mapping_type,
				resource_type: entry.resource_type
			};
			if (entry.constant_value !== undefined) {
				if (entry.constant_value !== null && typeof entry.constant_value !== 'string') {
					return json({ error: 'constant_value must be a string or null' }, { status: 400 });
				}
				mapped.constant_value = entry.constant_value;
			}
			if (entry.transform !== undefined) {
				if (entry.transform !== null && typeof entry.transform !== 'string') {
					return json({ error: 'transform must be a string or null' }, { status: 400 });
				}
				mapped.transform = entry.transform;
			}
			mappings.push(mapped);
		}
		const data: ScimReplaceMappingsRequest = { mappings };
		const result = await replaceScimTargetMappings(params.id, data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to replace mappings' }, { status: 500 });
	}
};
