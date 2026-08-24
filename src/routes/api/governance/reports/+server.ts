import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listReports, generateReport } from '$lib/api/governance-reporting';
import type { GenerateReportRequest, OutputFormat } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const OUTPUT_FORMATS = ['json', 'csv'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const result = await listReports(
			{
				template_id: url.searchParams.get('template_id') ?? undefined,
				status: url.searchParams.get('status') ?? undefined,
				from_date: url.searchParams.get('from_date') ?? undefined,
				to_date: url.searchParams.get('to_date') ?? undefined,
				limit: Number(url.searchParams.get('limit') ?? '50'),
				offset: Number(url.searchParams.get('offset') ?? '0')
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.template_id !== 'string' || body.template_id.length === 0) {
		error(400, 'template_id is required');
	}
	if (!OUTPUT_FORMATS.includes(body.output_format as (typeof OUTPUT_FORMATS)[number])) {
		error(400, 'output_format is required');
	}
	const data: GenerateReportRequest = {
		template_id: body.template_id,
		output_format: body.output_format as OutputFormat
	};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string') {
			error(400, 'name must be a string');
		}
		data.name = body.name;
	}
	if (body.parameters !== undefined) {
		if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
			error(400, 'parameters must be an object');
		}
		data.parameters = body.parameters as Record<string, unknown>;
	}
	try {
		const result = await generateReport(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
