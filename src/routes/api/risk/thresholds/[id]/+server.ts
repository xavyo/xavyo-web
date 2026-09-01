import { json, error, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRiskThreshold, updateRiskThreshold, deleteRiskThreshold } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import type { UpdateRiskThresholdRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await getRiskThreshold(params.id, locals.accessToken, locals.tenantId, fetch);
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
		const data: UpdateRiskThresholdRequest = {};
		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || body.name.length === 0) {
				error(400, 'name must be a non-empty string');
			}
			data.name = body.name;
		}
		if (body.score_value !== undefined) {
			try {
				data.score_value = requireFiniteNumber(body.score_value, 'score_value');
			} catch (e) {
				if (e instanceof JsonObjectError) error(400, e.message);
				throw e;
			}
		}
		if (body.severity !== undefined) {
			if (body.severity !== 'info' && body.severity !== 'warning' && body.severity !== 'critical') {
				error(400, 'severity must be info, warning, or critical');
			}
			data.severity = body.severity;
		}
		if (body.action !== undefined) {
			if (body.action !== 'alert' && body.action !== 'require_mfa' && body.action !== 'block') {
				error(400, 'action must be alert, require_mfa, or block');
			}
			data.action = body.action;
		}
		if (body.cooldown_hours !== undefined) {
			try {
				data.cooldown_hours = parseBoundedInteger(
					body.cooldown_hours,
					0,
					8760,
					'cooldown_hours'
				);
			} catch (e) {
				if (e instanceof JsonObjectError) error(400, e.message);
				throw e;
			}
		}
		if (body.is_enabled !== undefined) {
			if (typeof body.is_enabled !== 'boolean') {
				error(400, 'is_enabled must be a boolean');
			}
			data.is_enabled = body.is_enabled;
		}
		const result = await updateRiskThreshold(
			params.id,
			data,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
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
		await deleteRiskThreshold(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
