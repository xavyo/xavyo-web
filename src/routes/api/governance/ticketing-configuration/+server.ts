import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listTicketingConfigs, createTicketingConfig } from '$lib/api/governance-operations';
import type { CreateTicketingConfigRequest, TicketingSystemType } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

const TICKETING_TYPES = ['service_now', 'jira', 'webhook'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await listTicketingConfigs(
			{
				ticketing_type: url.searchParams.get('ticketing_type') ?? undefined,
				is_active: url.searchParams.has('is_active') ? url.searchParams.get('is_active') === 'true' : undefined,
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
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
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
		if (!TICKETING_TYPES.includes(body.ticketing_type as (typeof TICKETING_TYPES)[number])) {
			error(400, 'ticketing_type is required');
		}
		if (typeof body.endpoint_url !== 'string' || body.endpoint_url.length === 0) {
			error(400, 'endpoint_url is required');
		}
		if (typeof body.credentials !== 'string' || body.credentials.length === 0) {
			error(400, 'credentials is required');
		}
		let pollingInterval: number;
		try {
			pollingInterval =
				body.polling_interval_seconds === undefined
					? 300
					: parseBoundedInteger(
							body.polling_interval_seconds,
							60,
							3600,
							'polling_interval_seconds'
						);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
		const data: CreateTicketingConfigRequest = {
			name: body.name,
			ticketing_type: body.ticketing_type as TicketingSystemType,
			endpoint_url: body.endpoint_url,
			credentials: body.credentials,
			polling_interval_seconds: pollingInterval
		};
		if (body.field_mappings !== undefined) {
			data.field_mappings = body.field_mappings;
		}
		if (body.default_assignee !== undefined) {
			if (typeof body.default_assignee !== 'string') {
				error(400, 'default_assignee must be a string');
			}
			data.default_assignee = body.default_assignee;
		}
		if (body.default_assignment_group !== undefined) {
			if (typeof body.default_assignment_group !== 'string') {
				error(400, 'default_assignment_group must be a string');
			}
			data.default_assignment_group = body.default_assignment_group;
		}
		if (body.project_key !== undefined) {
			if (typeof body.project_key !== 'string') {
				error(400, 'project_key must be a string');
			}
			data.project_key = body.project_key;
		}
		if (body.issue_type !== undefined) {
			if (typeof body.issue_type !== 'string') {
				error(400, 'issue_type must be a string');
			}
			data.issue_type = body.issue_type;
		}
		const result = await createTicketingConfig(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
