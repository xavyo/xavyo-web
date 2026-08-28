import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listTemplates, createTemplate } from '$lib/api/governance-reporting';
import type {
	ComplianceStandard,
	CreateReportTemplateRequest,
	ReportTemplateType,
	TemplateDefinition
} from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

const TEMPLATE_TYPES = [
	'access_review',
	'sod_violations',
	'certification_status',
	'user_access',
	'audit_trail'
] as const;
const COMPLIANCE_STANDARDS = ['sox', 'gdpr', 'hipaa', 'custom'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await listTemplates(
			{
				template_type: url.searchParams.get('template_type') ?? undefined,
				compliance_standard: url.searchParams.get('compliance_standard') ?? undefined,
				include_system: url.searchParams.get('include_system') === 'false' ? false : undefined,
				...listPagination(url)
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (!TEMPLATE_TYPES.includes(body.template_type as (typeof TEMPLATE_TYPES)[number])) {
		error(400, 'template_type is required');
	}
	if (!body.definition || typeof body.definition !== 'object' || Array.isArray(body.definition)) {
		error(400, 'definition is required');
	}
	const data: CreateReportTemplateRequest = {
		name: body.name,
		template_type: body.template_type as ReportTemplateType,
		definition: body.definition as TemplateDefinition
	};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.compliance_standard !== undefined) {
		if (
			!COMPLIANCE_STANDARDS.includes(body.compliance_standard as (typeof COMPLIANCE_STANDARDS)[number])
		) {
			error(400, 'compliance_standard is required');
		}
		data.compliance_standard = body.compliance_standard as ComplianceStandard;
	}
	try {
		const result = await createTemplate(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
