import { json, error, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskFactors, createRiskFactor } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const category = url.searchParams.get('category') ?? undefined;
	const is_enabled = url.searchParams.get('is_enabled') === 'true' ? true : url.searchParams.get('is_enabled') === 'false' ? false : undefined;
	const factor_type = url.searchParams.get('factor_type') ?? undefined;

	try {
		const result = await listRiskFactors(
			{ category, is_enabled, factor_type, ...listPagination(url) },
			locals.accessToken, locals.tenantId, fetch
		);
		return json(result);
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
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
		if (body.category !== 'static' && body.category !== 'dynamic') {
			error(400, 'category is required');
		}
		if (typeof body.factor_type !== 'string' || body.factor_type.length === 0) {
			error(400, 'factor_type is required');
		}
		let weight: number;
		try {
			weight = requireFiniteNumber(body.weight, 'weight');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
		if (body.description !== undefined && typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		if (body.is_enabled !== undefined && typeof body.is_enabled !== 'boolean') {
			error(400, 'is_enabled must be a boolean');
		}
		const result = await createRiskFactor(
			{
				name: body.name,
				category: body.category,
				factor_type: body.factor_type,
				weight,
				description: typeof body.description === 'string' ? body.description : undefined,
				is_enabled: typeof body.is_enabled === 'boolean' ? body.is_enabled : undefined
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result, { status: 201 });
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
