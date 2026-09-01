import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCorrelationThresholds, upsertCorrelationThresholds } from '$lib/api/correlation';
import type { UpsertCorrelationThresholdRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getCorrelationThresholds(params.connectorId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

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
	const data: UpsertCorrelationThresholdRequest = {};
	if (body.auto_confirm_threshold !== undefined) {
		try {
			data.auto_confirm_threshold = requireFiniteNumber(
				body.auto_confirm_threshold,
				'auto_confirm_threshold'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	if (body.manual_review_threshold !== undefined) {
		try {
			data.manual_review_threshold = requireFiniteNumber(
				body.manual_review_threshold,
				'manual_review_threshold'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
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
		try {
			data.batch_size = parseBoundedInteger(body.batch_size, 1, 10_000, 'batch_size');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
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
