import { json, error, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskThresholds, createRiskThreshold } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const severity = url.searchParams.get('severity') ?? undefined;
	const action = url.searchParams.get('action') ?? undefined;
	const is_enabled = url.searchParams.get('is_enabled') === 'true' ? true : url.searchParams.get('is_enabled') === 'false' ? false : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listRiskThresholds(
			{ severity, action, is_enabled, limit, offset },
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
		if (typeof body.score_value !== 'number') {
			error(400, 'score_value is required');
		}
		if (body.severity !== 'info' && body.severity !== 'warning' && body.severity !== 'critical') {
			error(400, 'severity is required');
		}
		const result = await createRiskThreshold(
			{
				name: body.name,
				score_value: body.score_value,
				severity: body.severity
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
