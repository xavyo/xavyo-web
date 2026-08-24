import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getEntitlement, updateEntitlement, deleteEntitlement } from '$lib/api/governance';
import type {
	DataProtectionClassification,
	EntitlementStatus,
	LegalBasis,
	RiskLevel,
	UpdateEntitlementRequest
} from '$lib/api/types';

const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
const STATUSES = ['active', 'inactive', 'suspended'] as const;
const CLASSIFICATIONS = ['none', 'personal', 'sensitive', 'special_category'] as const;
const LEGAL_BASES = [
	'consent',
	'contract',
	'legal_obligation',
	'vital_interest',
	'public_task',
	'legitimate_interest'
] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getEntitlement(params.id, locals.accessToken, locals.tenantId, fetch);

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
	const data: UpdateEntitlementRequest = {};
	if (body.application_id !== undefined) {
		if (typeof body.application_id !== 'string' || body.application_id.length === 0) {
			error(400, 'application_id must be a non-empty string');
		}
		data.application_id = body.application_id;
	}
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
	if (body.risk_level !== undefined) {
		if (!RISK_LEVELS.includes(body.risk_level as (typeof RISK_LEVELS)[number])) {
			error(400, 'risk_level is required');
		}
		data.risk_level = body.risk_level as RiskLevel;
	}
	if (body.status !== undefined) {
		if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
			error(400, 'status is required');
		}
		data.status = body.status as EntitlementStatus;
	}
	if (body.owner_id !== undefined) {
		if (typeof body.owner_id !== 'string') {
			error(400, 'owner_id must be a string');
		}
		data.owner_id = body.owner_id;
	}
	if (body.external_id !== undefined) {
		if (typeof body.external_id !== 'string') {
			error(400, 'external_id must be a string');
		}
		data.external_id = body.external_id;
	}
	if (body.is_delegable !== undefined) {
		if (typeof body.is_delegable !== 'boolean') {
			error(400, 'is_delegable must be a boolean');
		}
		data.is_delegable = body.is_delegable;
	}
	if (body.data_protection_classification !== undefined) {
		if (
			!CLASSIFICATIONS.includes(
				body.data_protection_classification as (typeof CLASSIFICATIONS)[number]
			)
		) {
			error(400, 'data_protection_classification is required');
		}
		data.data_protection_classification =
			body.data_protection_classification as DataProtectionClassification;
	}
	if (body.legal_basis !== undefined) {
		if (!LEGAL_BASES.includes(body.legal_basis as (typeof LEGAL_BASES)[number])) {
			error(400, 'legal_basis is required');
		}
		data.legal_basis = body.legal_basis as LegalBasis;
	}
	if (body.retention_period_days !== undefined) {
		if (typeof body.retention_period_days !== 'number') {
			error(400, 'retention_period_days must be a number');
		}
		data.retention_period_days = body.retention_period_days;
	}
	if (body.data_controller !== undefined) {
		if (typeof body.data_controller !== 'string') {
			error(400, 'data_controller must be a string');
		}
		data.data_controller = body.data_controller;
	}
	if (body.data_processor !== undefined) {
		if (typeof body.data_processor !== 'string') {
			error(400, 'data_processor must be a string');
		}
		data.data_processor = body.data_processor;
	}
	if (body.purposes !== undefined) {
		if (
			!Array.isArray(body.purposes) ||
			body.purposes.some((p) => typeof p !== 'string')
		) {
			error(400, 'purposes must be an array of strings');
		}
		data.purposes = body.purposes as string[];
	}
	if (body.metadata !== undefined) {
		if (!body.metadata || typeof body.metadata !== 'object' || Array.isArray(body.metadata)) {
			error(400, 'metadata must be an object');
		}
		data.metadata = body.metadata as Record<string, unknown>;
	}
	const result = await updateEntitlement(
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

	await deleteEntitlement(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
