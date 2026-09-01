import { json, error, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskThresholds, createRiskThreshold } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import type { CreateRiskThresholdRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const severity = url.searchParams.get('severity') ?? undefined;
	const action = url.searchParams.get('action') ?? undefined;
	const is_enabled = url.searchParams.get('is_enabled') === 'true' ? true : url.searchParams.get('is_enabled') === 'false' ? false : undefined;

	try {
		const result = await listRiskThresholds(
			{ severity, action, is_enabled, ...listPagination(url) },
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
		let score_value: number;
		try {
			score_value = requireFiniteNumber(body.score_value, 'score_value');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
		if (body.severity !== 'info' && body.severity !== 'warning' && body.severity !== 'critical') {
			error(400, 'severity is required');
		}
		const data: CreateRiskThresholdRequest = {
			name: body.name,
			score_value,
			severity: body.severity
		};
		if (body.action !== undefined) {
			if (body.action !== 'alert' && body.action !== 'require_mfa' && body.action !== 'block') {
				error(400, 'action must be alert, require_mfa, or block');
			}
			data.action = body.action;
		}
		if (body.cooldown_hours !== undefined) {
			try {
				data.cooldown_hours = parseBoundedInteger(body.cooldown_hours, 1, 720, 'cooldown_hours');
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
		const result = await createRiskThreshold(
			data,
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
