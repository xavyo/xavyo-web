import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScimMappings, updateScimMappings } from '$lib/api/scim';
import type { MappingRequest, UpdateMappingsRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';

const TRANSFORMS = ['lowercase', 'uppercase', 'trim'] as const;

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listScimMappings(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

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
	if (!Array.isArray(body.mappings) || body.mappings.length === 0) {
		return json({ error: 'mappings is required' }, { status: 400 });
	}
	const mappings: MappingRequest[] = [];
	for (const item of body.mappings) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			return json({ error: 'mappings items must be objects' }, { status: 400 });
		}
		const rec = item as Record<string, unknown>;
		if (typeof rec.scim_path !== 'string' || rec.scim_path.length === 0) {
			return json({ error: 'scim_path is required' }, { status: 400 });
		}
		if (typeof rec.xavyo_field !== 'string' || rec.xavyo_field.length === 0) {
			return json({ error: 'xavyo_field is required' }, { status: 400 });
		}
		if (rec.transform !== null && !TRANSFORMS.includes(rec.transform as (typeof TRANSFORMS)[number])) {
			return json({ error: 'transform is required' }, { status: 400 });
		}
		if (typeof rec.required !== 'boolean') {
			return json({ error: 'required is required' }, { status: 400 });
		}
		mappings.push({
			scim_path: rec.scim_path,
			xavyo_field: rec.xavyo_field,
			transform: rec.transform as MappingRequest['transform'],
			required: rec.required
		});
	}
	const data: UpdateMappingsRequest = { mappings };
	try {
		const result = await updateScimMappings(data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to update SCIM mappings' }, { status: 500 });
	}
};
