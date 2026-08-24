import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getCorrelationThresholds, upsertCorrelationThresholds } from '$lib/api/correlation';
import type { UpsertCorrelationThresholdRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getCorrelationThresholds(params.connectorId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

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
	const data: UpsertCorrelationThresholdRequest = {};
	if (body.auto_confirm_threshold !== undefined) {
		if (typeof body.auto_confirm_threshold !== 'number') {
			error(400, 'auto_confirm_threshold must be a number');
		}
		data.auto_confirm_threshold = body.auto_confirm_threshold;
	}
	if (body.manual_review_threshold !== undefined) {
		if (typeof body.manual_review_threshold !== 'number') {
			error(400, 'manual_review_threshold must be a number');
		}
		data.manual_review_threshold = body.manual_review_threshold;
	}
	if (body.tuning_mode !== undefined) {
		if (typeof body.tuning_mode !== 'boolean') {
			error(400, 'tuning_mode must be a boolean');
		}
		data.tuning_mode = body.tuning_mode;
	}
	if (body.include_deactivated !== undefined) {
		if (typeof body.include_deactivated !== 'boolean') {
			error(400, 'include_deactivated must be a boolean');
		}
		data.include_deactivated = body.include_deactivated;
	}
	if (body.batch_size !== undefined) {
		if (typeof body.batch_size !== 'number') {
			error(400, 'batch_size must be a number');
		}
		data.batch_size = body.batch_size;
	}
	const result = await upsertCorrelationThresholds(
		params.connectorId,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
