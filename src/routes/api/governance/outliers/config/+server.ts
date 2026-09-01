import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOutlierConfig, updateOutlierConfig } from '$lib/api/outliers';
import type { ScoringWeights, UpdateOutlierConfigRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger, requireFiniteNumber } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getOutlierConfig(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {
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
	const data: UpdateOutlierConfigRequest = {};
	try {
	if (body.confidence_threshold !== undefined) {
		data.confidence_threshold = requireFiniteNumber(
			body.confidence_threshold,
			'confidence_threshold'
		);
	}
	if (body.frequency_threshold !== undefined) {
		data.frequency_threshold = requireFiniteNumber(
			body.frequency_threshold,
			'frequency_threshold'
		);
	}
	if (body.min_peer_group_size !== undefined) {
		data.min_peer_group_size = parseBoundedInteger(
			body.min_peer_group_size,
			1,
			1_000_000,
			'min_peer_group_size'
		);
	}
	if (body.scoring_weights !== undefined) {
		if (
			!body.scoring_weights ||
			typeof body.scoring_weights !== 'object' ||
			Array.isArray(body.scoring_weights)
		) {
			error(400, 'scoring_weights must be an object');
		}
		const weights = body.scoring_weights as Record<string, unknown>;
		data.scoring_weights = {
			role_frequency: requireFiniteNumber(weights.role_frequency, 'scoring_weights.role_frequency'),
			entitlement_count: requireFiniteNumber(
				weights.entitlement_count,
				'scoring_weights.entitlement_count'
			),
			assignment_pattern: requireFiniteNumber(
				weights.assignment_pattern,
				'scoring_weights.assignment_pattern'
			),
			peer_group_coverage: requireFiniteNumber(
				weights.peer_group_coverage,
				'scoring_weights.peer_group_coverage'
			),
			historical_deviation: requireFiniteNumber(
				weights.historical_deviation,
				'scoring_weights.historical_deviation'
			)
		} satisfies ScoringWeights;
	}
	if (body.schedule_cron !== undefined) {
		if (typeof body.schedule_cron !== 'string') {
			error(400, 'schedule_cron must be a string');
		}
		data.schedule_cron = body.schedule_cron;
	}
	if (body.retention_days !== undefined) {
		data.retention_days = parseBoundedInteger(body.retention_days, 1, 3650, 'retention_days');
	}
	if (body.is_enabled !== undefined) {
		if (typeof body.is_enabled !== 'boolean') {
			error(400, 'is_enabled must be a boolean');
		}
		data.is_enabled = body.is_enabled;
	}
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	const result = await updateOutlierConfig(data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
