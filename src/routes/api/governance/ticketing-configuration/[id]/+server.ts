import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getTicketingConfig,
	updateTicketingConfig,
	deleteTicketingConfig
} from '$lib/api/governance-operations';
import type { UpdateTicketingConfigRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await getTicketingConfig(
			params.id,
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

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
		const data: UpdateTicketingConfigRequest = {};
		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || body.name.length === 0) {
				error(400, 'name must be a non-empty string');
			}
			data.name = body.name;
		}
		if (body.endpoint_url !== undefined) {
			if (typeof body.endpoint_url !== 'string' || body.endpoint_url.length === 0) {
				error(400, 'endpoint_url must be a non-empty string');
			}
			data.endpoint_url = body.endpoint_url;
		}
		if (body.credentials !== undefined) {
			if (typeof body.credentials !== 'string' || body.credentials.length === 0) {
				error(400, 'credentials must be a non-empty string');
			}
			data.credentials = body.credentials;
		}
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
		if (body.polling_interval_seconds !== undefined) {
			if (typeof body.polling_interval_seconds !== 'number') {
				error(400, 'polling_interval_seconds must be a number');
			}
			data.polling_interval_seconds = body.polling_interval_seconds;
		}
		const result = await updateTicketingConfig(
			params.id,
			data,
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

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		await deleteTicketingConfig(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
