import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMicroCertifications, bulkDecideMicroCertifications } from '$lib/api/micro-certifications';
import { listPagination } from '$lib/server/list-pagination';
import type { BulkDecisionRequest, CertDecision } from '$lib/api/types';

const DECISIONS = ['approve', 'revoke', 'reduce', 'delegate'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const status = url.searchParams.get('status') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const reviewer_id = url.searchParams.get('reviewer_id') ?? undefined;
	const entitlement_id = url.searchParams.get('entitlement_id') ?? undefined;
	const assignment_id = url.searchParams.get('assignment_id') ?? undefined;
	const trigger_rule_id = url.searchParams.get('trigger_rule_id') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const escalated =
		url.searchParams.get('escalated') !== null
			? url.searchParams.get('escalated') === 'true'
			: undefined;
	const past_deadline =
		url.searchParams.get('past_deadline') !== null
			? url.searchParams.get('past_deadline') === 'true'
			: undefined;

	const result = await listMicroCertifications(
		{
			status,
			user_id,
			reviewer_id,
			entitlement_id,
			assignment_id,
			trigger_rule_id,
			from_date,
			to_date,
			escalated,
			past_deadline,
			...listPagination(url)
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (
		!Array.isArray(body.certification_ids) ||
		body.certification_ids.length === 0 ||
		body.certification_ids.some((id) => typeof id !== 'string' || id.length === 0)
	) {
		error(400, 'certification_ids is required');
	}
	if (!DECISIONS.includes(body.decision as (typeof DECISIONS)[number])) {
		error(400, 'decision is required');
	}
	const data: BulkDecisionRequest = {
		certification_ids: body.certification_ids as string[],
		decision: body.decision as CertDecision
	};
	if (body.comment !== undefined) {
		if (typeof body.comment !== 'string') {
			error(400, 'comment must be a string');
		}
		data.comment = body.comment;
	}
	const result = await bulkDecideMicroCertifications(
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
