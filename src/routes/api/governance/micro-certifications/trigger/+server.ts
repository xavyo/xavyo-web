import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { manualTriggerCertification } from '$lib/api/micro-certifications';
import type { ManualTriggerRequest } from '$lib/api/types';

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
	if (typeof body.user_id !== 'string' || body.user_id.length === 0) {
		error(400, 'user_id is required');
	}
	if (typeof body.entitlement_id !== 'string' || body.entitlement_id.length === 0) {
		error(400, 'entitlement_id is required');
	}
	if (typeof body.reason !== 'string' || body.reason.length === 0) {
		error(400, 'reason is required');
	}
	const data: ManualTriggerRequest = {
		user_id: body.user_id,
		entitlement_id: body.entitlement_id,
		reason: body.reason
	};
	if (body.trigger_rule_id !== undefined) {
		if (typeof body.trigger_rule_id !== 'string') {
			error(400, 'trigger_rule_id must be a string');
		}
		data.trigger_rule_id = body.trigger_rule_id;
	}
	if (body.reviewer_id !== undefined) {
		if (typeof body.reviewer_id !== 'string') {
			error(400, 'reviewer_id must be a string');
		}
		data.reviewer_id = body.reviewer_id;
	}
	try {
		const result = await manualTriggerCertification(
			data,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result, { status: 201 });
	} catch (e: any) {
		const msg = e?.message || e?.body?.message || String(e);
		const status = e?.status || 500;
		return json({ error: msg, detail: e?.body }, { status });
	}
};
