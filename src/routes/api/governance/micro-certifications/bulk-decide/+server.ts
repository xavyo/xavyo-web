import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bulkDecideMicroCertifications } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';
import type { BulkDecisionRequest, CertDecision } from '$lib/api/types';

const DECISIONS = ['approve', 'revoke', 'reduce', 'delegate'] as const;

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

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
