import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createWorkflowSchema } from '$lib/schemas/approval-workflows';
import { createApprovalWorkflow } from '$lib/api/approval-workflows';
import { ApiError } from '$lib/api/client';
import type { CreateApprovalWorkflowRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createWorkflowSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createWorkflowSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateApprovalWorkflowRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			steps: [{ approver_type: 'manager' }]
		};

		let workflowId: string;
		try {
			const workflow = await createApprovalWorkflow(
				body,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			workflowId = workflow.id;
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, `/governance/approval-config/workflows/${workflowId}`);
	}
};
