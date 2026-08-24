import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listA2aTasks, createA2aTask } from '$lib/api/a2a';
import type { CreateA2aTaskRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const state = url.searchParams.get('state') ?? undefined;
	const target_agent_id = url.searchParams.get('target_agent_id') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listA2aTasks(
		{ state, target_agent_id, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.target_agent_id !== 'string' || body.target_agent_id.length === 0) {
		error(400, 'target_agent_id is required');
	}
	if (typeof body.task_type !== 'string' || body.task_type.length === 0) {
		error(400, 'task_type is required');
	}
	if (!body.input || typeof body.input !== 'object' || Array.isArray(body.input)) {
		error(400, 'input is required');
	}
	const data: CreateA2aTaskRequest = {
		target_agent_id: body.target_agent_id,
		task_type: body.task_type,
		input: body.input as Record<string, unknown>
	};
	if (body.callback_url !== undefined) {
		if (typeof body.callback_url !== 'string') {
			error(400, 'callback_url must be a string');
		}
		data.callback_url = body.callback_url;
	}
	if (body.source_agent_id !== undefined) {
		if (typeof body.source_agent_id !== 'string') {
			error(400, 'source_agent_id must be a string');
		}
		data.source_agent_id = body.source_agent_id;
	}
	const result = await createA2aTask(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
