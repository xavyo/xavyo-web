import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCampaign, updateCampaign, deleteCampaign } from '$lib/api/governance';
import type {
	CampaignReviewerType,
	CampaignScopeConfig,
	CampaignScopeType,
	UpdateCampaignRequest
} from '$lib/api/types';

const SCOPE_TYPES = ['all_users', 'department', 'application', 'entitlement'] as const;
const REVIEWER_TYPES = [
	'user_manager',
	'application_owner',
	'entitlement_owner',
	'specific_users'
] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getCampaign(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

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
	const data: UpdateCampaignRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.scope_type !== undefined) {
		if (!SCOPE_TYPES.includes(body.scope_type as (typeof SCOPE_TYPES)[number])) {
			error(400, 'scope_type is required');
		}
		data.scope_type = body.scope_type as CampaignScopeType;
	}
	if (body.scope_config !== undefined) {
		if (
			!body.scope_config ||
			typeof body.scope_config !== 'object' ||
			Array.isArray(body.scope_config)
		) {
			error(400, 'scope_config must be an object');
		}
		data.scope_config = body.scope_config as CampaignScopeConfig;
	}
	if (body.reviewer_type !== undefined) {
		if (!REVIEWER_TYPES.includes(body.reviewer_type as (typeof REVIEWER_TYPES)[number])) {
			error(400, 'reviewer_type is required');
		}
		data.reviewer_type = body.reviewer_type as CampaignReviewerType;
	}
	if (body.specific_reviewers !== undefined) {
		if (
			!Array.isArray(body.specific_reviewers) ||
			body.specific_reviewers.some((id) => typeof id !== 'string')
		) {
			error(400, 'specific_reviewers must be an array of strings');
		}
		data.specific_reviewers = body.specific_reviewers as string[];
	}
	if (body.deadline !== undefined) {
		if (typeof body.deadline !== 'string' || body.deadline.length === 0) {
			error(400, 'deadline must be a non-empty string');
		}
		data.deadline = body.deadline;
	}
	const result = await updateCampaign(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteCampaign(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
