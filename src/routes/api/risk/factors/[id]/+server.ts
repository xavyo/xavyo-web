import { json, error, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRiskFactor, updateRiskFactor, deleteRiskFactor } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import type { UpdateRiskFactorRequest } from '$lib/api/types';
import { JsonObjectError, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await getRiskFactor(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
		const data: UpdateRiskFactorRequest = {};
		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || body.name.length === 0) {
				error(400, 'name must be a non-empty string');
			}
			data.name = body.name;
		}
		if (body.category !== undefined) {
			if (body.category !== 'static' && body.category !== 'dynamic') {
				error(400, 'category must be static or dynamic');
			}
			data.category = body.category;
		}
		if (body.factor_type !== undefined) {
			if (typeof body.factor_type !== 'string' || body.factor_type.length === 0) {
				error(400, 'factor_type must be a non-empty string');
			}
			data.factor_type = body.factor_type;
		}
		if (body.weight !== undefined) {
			try {
				data.weight = requireFiniteNumber(body.weight, 'weight');
			} catch (e) {
				if (e instanceof JsonObjectError) error(400, e.message);
				throw e;
			}
		}
		if (body.description !== undefined) {
			if (typeof body.description !== 'string') {
				error(400, 'description must be a string');
			}
			data.description = body.description;
		}
		if (body.is_enabled !== undefined) {
			if (typeof body.is_enabled !== 'boolean') {
				error(400, 'is_enabled must be a boolean');
			}
			data.is_enabled = body.is_enabled;
		}
		const result = await updateRiskFactor(params.id, data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		await deleteRiskFactor(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
