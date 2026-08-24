import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateOutlierReport } from '$lib/api/outliers';
import type { OutlierGenerateReportRequest } from '$lib/api/types';

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
	if (typeof body.start_date !== 'string' || body.start_date.length === 0) {
		error(400, 'start_date is required');
	}
	if (typeof body.end_date !== 'string' || body.end_date.length === 0) {
		error(400, 'end_date is required');
	}
	const data: OutlierGenerateReportRequest = {
		start_date: body.start_date,
		end_date: body.end_date
	};
	if (body.include_trends !== undefined) {
		if (typeof body.include_trends !== 'boolean') {
			error(400, 'include_trends must be a boolean');
		}
		data.include_trends = body.include_trends;
	}
	if (body.include_peer_breakdown !== undefined) {
		if (typeof body.include_peer_breakdown !== 'boolean') {
			error(400, 'include_peer_breakdown must be a boolean');
		}
		data.include_peer_breakdown = body.include_peer_breakdown;
	}
	const result = await generateOutlierReport(data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
