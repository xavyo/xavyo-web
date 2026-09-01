import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminListItems, adminCreateItem } from '$lib/api/catalog';
import type { CatalogItemType, CreateCatalogItemRequest, FormField, RequestabilityRules } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

const ITEM_TYPES = ['role', 'entitlement', 'resource'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const category_id = url.searchParams.get('category_id') ?? undefined;
	const item_type = url.searchParams.get('item_type') ?? undefined;
	const enabled = url.searchParams.get('enabled') !== null ? url.searchParams.get('enabled') === 'true' : undefined;
	const search = url.searchParams.get('search') ?? undefined;
	const tag = url.searchParams.get('tag') ?? undefined;
	const result = await adminListItems({ category_id, item_type, enabled, search, tag, ...listPagination(url) }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (!ITEM_TYPES.includes(body.item_type as (typeof ITEM_TYPES)[number])) {
		error(400, 'item_type is required');
	}
	const data: CreateCatalogItemRequest = {
		name: body.name,
		item_type: body.item_type as CatalogItemType
	};
	if (body.category_id !== undefined) {
		if (typeof body.category_id !== 'string') {
			error(400, 'category_id must be a string');
		}
		data.category_id = body.category_id;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.reference_id !== undefined) {
		if (typeof body.reference_id !== 'string') {
			error(400, 'reference_id must be a string');
		}
		data.reference_id = body.reference_id;
	}
	if (body.requestability_rules !== undefined) {
		if (
			!body.requestability_rules ||
			typeof body.requestability_rules !== 'object' ||
			Array.isArray(body.requestability_rules)
		) {
			error(400, 'requestability_rules must be an object');
		}
		data.requestability_rules = body.requestability_rules as RequestabilityRules;
	}
	if (body.form_fields !== undefined) {
		if (!Array.isArray(body.form_fields)) {
			error(400, 'form_fields must be an array');
		}
		data.form_fields = body.form_fields as FormField[];
	}
	if (body.tags !== undefined) {
		if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== 'string')) {
			error(400, 'tags must be an array of strings');
		}
		data.tags = body.tags as string[];
	}
	if (body.icon !== undefined) {
		if (typeof body.icon !== 'string') {
			error(400, 'icon must be a string');
		}
		data.icon = body.icon;
	}
	const result = await adminCreateItem(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
