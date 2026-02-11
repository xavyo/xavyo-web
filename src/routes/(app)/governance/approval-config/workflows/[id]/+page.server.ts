import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateWorkflowSchema, addStepSchema } from '$lib/schemas/approval-workflows';
import {
	getApprovalWorkflow,
	updateApprovalWorkflow,
	deleteApprovalWorkflow,
	setDefaultWorkflow
} from '$lib/api/approval-workflows';
import { ApiError } from '$lib/api/client';
import type { UpdateApprovalWorkflowRequest, CreateApprovalStepRequest, ApproverType } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let workflow;
	try {
		workflow = await getApprovalWorkflow(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load workflow');
	}

	const editForm = await superValidate(
		{ name: workflow.name, description: workflow.description ?? undefined },
		zod(updateWorkflowSchema)
	);

	const stepForm = await superValidate(zod(addStepSchema));

	return { workflow, editForm, stepForm };
};

export const actions: Actions = {
	edit: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateWorkflowSchema));

		if (!form.valid) {
			return fail(400, { editForm: form });
		}

		const body: UpdateApprovalWorkflowRequest = {
			name: form.data.name || undefined,
			description: form.data.description || undefined
		};

		try {
			await updateApprovalWorkflow(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Workflow updated successfully');
	},

	setDefault: async ({ params, locals, fetch }) => {
		try {
			await setDefaultWorkflow(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'setDefault' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteApprovalWorkflow(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/governance/approval-config');
	},

	addStep: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(addStepSchema));

		if (!form.valid) {
			return fail(400, { stepForm: form });
		}

		// Load current workflow to get existing steps
		let workflow;
		try {
			workflow = await getApprovalWorkflow(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Failed to load workflow', { status: 500 });
		}

		const newStep: CreateApprovalStepRequest = {
			approver_type: form.data.approver_type as ApproverType,
			specific_approvers: form.data.specific_approvers
				? form.data.specific_approvers.split(',').map((s) => s.trim()).filter(Boolean)
				: undefined
		};

		// Build updated steps array: existing steps + new step
		const existingSteps: CreateApprovalStepRequest[] = (workflow.steps || []).map((s) => ({
			approver_type: s.approver_type as ApproverType,
			specific_approvers: s.specific_approvers || undefined
		}));

		try {
			await updateApprovalWorkflow(
				params.id,
				{ steps: [...existingSteps, newStep] },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Step added successfully');
	},

	removeStep: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const stepId = formData.get('step_id') as string;

		// Load current workflow to get existing steps
		let workflow;
		try {
			workflow = await getApprovalWorkflow(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to load workflow' });
		}

		// Build updated steps array without the removed step
		const remainingSteps: CreateApprovalStepRequest[] = (workflow.steps || [])
			.filter((s) => s.id !== stepId)
			.map((s) => ({
				approver_type: s.approver_type as ApproverType,
				specific_approvers: s.specific_approvers || undefined
			}));

		try {
			await updateApprovalWorkflow(
				params.id,
				{ steps: remainingSteps },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'removeStep' };
	}
};
