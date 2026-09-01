import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminUpdateItem, adminDeleteItem } from '$lib/api/catalog';
import type {
	CatalogItemType,
	FormField,
	RequestabilityRules,
	UpdateCatalogItemRequest
} from '$lib/api/types';

const ITEM_TYPES = ['role', 'entitlement', 'resource'] as const;

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateCatalogItemRequest = {};
	if (body.category_id !== undefined) {
		if (body.category_id !== null && typeof body.category_id !== 'string') {
			error(400, 'category_id must be a string or null');
		}
		data.category_id = body.category_id as string | null;
	}
	if (body.item_type !== undefined) {
		if (!ITEM_TYPES.includes(body.item_type as (typeof ITEM_TYPES)[number])) {
			error(400, 'item_type is required');
		}
		data.item_type = body.item_type as CatalogItemType;
	}
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (body.description !== null && typeof body.description !== 'string') {
			error(400, 'description must be a string or null');
		}
		data.description = body.description as string | null;
	}
	if (body.reference_id !== undefined) {
		if (body.reference_id !== null && typeof body.reference_id !== 'string') {
			error(400, 'reference_id must be a string or null');
		}
		data.reference_id = body.reference_id as string | null;
	}
	if (body.requestability_rules !== undefined) {
		if (
			body.requestability_rules !== null &&
			(!body.requestability_rules ||
				typeof body.requestability_rules !== 'object' ||
				Array.isArray(body.requestability_rules))
		) {
			error(400, 'requestability_rules must be an object or null');
		}
		data.requestability_rules = body.requestability_rules as RequestabilityRules | null;
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
		if (body.icon !== null && typeof body.icon !== 'string') {
			error(400, 'icon must be a string or null');
		}
		data.icon = body.icon as string | null;
	}
	const result = await adminUpdateItem(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	await adminDeleteItem(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
