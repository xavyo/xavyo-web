import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listApprovalWorkflows, createApprovalWorkflow } from '$lib/api/approval-workflows';
import { ApiError } from '$lib/api/client';
import type { CreateApprovalStepRequest, CreateApprovalWorkflowRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

function parseSteps(value: unknown): CreateApprovalStepRequest[] {
	if (!Array.isArray(value)) {
		error(400, 'steps must be an array');
	}
	const steps: CreateApprovalStepRequest[] = [];
	for (const item of value) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			error(400, 'each step must be an object');
		}
		const step = item as Record<string, unknown>;
		if (
			step.approver_type !== 'manager' &&
			step.approver_type !== 'entitlement_owner' &&
			step.approver_type !== 'specific_users'
		) {
			error(400, 'approver_type is required');
		}
		const parsed: CreateApprovalStepRequest = { approver_type: step.approver_type };
		if (step.specific_approvers !== undefined) {
			if (
				!Array.isArray(step.specific_approvers) ||
				!step.specific_approvers.every((id) => typeof id === 'string')
			) {
				error(400, 'specific_approvers must be an array of strings');
			}
			parsed.specific_approvers = step.specific_approvers;
		}
		steps.push(parsed);
	}
	return steps;
}

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const isActiveParam = url.searchParams.get('is_active');
		const isDefaultParam = url.searchParams.get('is_default');
		const result = await listApprovalWorkflows(
			{
				is_active: isActiveParam !== null ? isActiveParam === 'true' : undefined,
				is_default: isDefaultParam !== null ? isDefaultParam === 'true' : undefined,
				...listPagination(url)
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ message: e.message }, { status: e.status });
		}
		throw e;
	}
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	const data: CreateApprovalWorkflowRequest = { name: body.name };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.is_default !== undefined) {
		if (typeof body.is_default !== 'boolean') {
			error(400, 'is_default must be a boolean');
		}
		data.is_default = body.is_default;
	}
	if (body.steps !== undefined) {
		data.steps = parseSteps(body.steps);
	}

	try {
		const result = await createApprovalWorkflow(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ message: e.message }, { status: e.status });
		}
		throw e;
	}
};
