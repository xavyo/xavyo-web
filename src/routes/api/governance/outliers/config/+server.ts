import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOutlierConfig, updateOutlierConfig } from '$lib/api/outliers';
import type { ScoringWeights, UpdateOutlierConfigRequest } from '$lib/api/types';

const WEIGHT_KEYS = [
	'role_frequency',
	'entitlement_count',
	'assignment_pattern',
	'peer_group_coverage',
	'historical_deviation'
] as const;

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
	if (body.confidence_threshold !== undefined) {
		if (typeof body.confidence_threshold !== 'number') {
			error(400, 'confidence_threshold must be a number');
		}
		data.confidence_threshold = body.confidence_threshold;
	}
	if (body.frequency_threshold !== undefined) {
		if (typeof body.frequency_threshold !== 'number') {
			error(400, 'frequency_threshold must be a number');
		}
		data.frequency_threshold = body.frequency_threshold;
	}
	if (body.min_peer_group_size !== undefined) {
		if (typeof body.min_peer_group_size !== 'number') {
			error(400, 'min_peer_group_size must be a number');
		}
		data.min_peer_group_size = body.min_peer_group_size;
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
		for (const key of WEIGHT_KEYS) {
			if (typeof weights[key] !== 'number') {
				error(400, 'scoring_weights is required');
			}
		}
		data.scoring_weights = {
			role_frequency: weights.role_frequency as number,
			entitlement_count: weights.entitlement_count as number,
			assignment_pattern: weights.assignment_pattern as number,
			peer_group_coverage: weights.peer_group_coverage as number,
			historical_deviation: weights.historical_deviation as number
		} satisfies ScoringWeights;
	}
	if (body.schedule_cron !== undefined) {
		if (typeof body.schedule_cron !== 'string') {
			error(400, 'schedule_cron must be a string');
		}
		data.schedule_cron = body.schedule_cron;
	}
	if (body.retention_days !== undefined) {
		if (typeof body.retention_days !== 'number') {
			error(400, 'retention_days must be a number');
		}
		data.retention_days = body.retention_days;
	}
	if (body.is_enabled !== undefined) {
		if (typeof body.is_enabled !== 'boolean') {
			error(400, 'is_enabled must be a boolean');
		}
		data.is_enabled = body.is_enabled;
	}
	const result = await updateOutlierConfig(data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
