import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateGroupSchema, addMemberSchema } from '$lib/schemas/approval-workflows';
import {
	getApprovalGroup,
	updateApprovalGroup,
	deleteApprovalGroup,
	enableApprovalGroup,
	disableApprovalGroup,
	addGroupMembers,
	removeGroupMembers
} from '$lib/api/approval-workflows';
import { ApiError } from '$lib/api/client';
import type { UpdateApprovalGroupRequest, ModifyMembersRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let group;
	try {
		group = await getApprovalGroup(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load group');
	}

	const editForm = await superValidate(
		{ name: group.name, description: group.description ?? undefined },
		zod(updateGroupSchema)
	);

	const memberForm = await superValidate(zod(addMemberSchema));

	return { group, editForm, memberForm };
};

export const actions: Actions = {
	edit: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateGroupSchema));

		if (!form.valid) {
			return fail(400, { editForm: form });
		}

		const body: UpdateApprovalGroupRequest = {
			name: form.data.name || undefined,
			description: form.data.description || undefined
		};

		try {
			await updateApprovalGroup(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Group updated successfully');
	},

	enable: async ({ params, locals, fetch }) => {
		try {
			await enableApprovalGroup(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'enabled' };
	},

	disable: async ({ params, locals, fetch }) => {
		try {
			await disableApprovalGroup(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'disabled' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteApprovalGroup(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/governance/approval-config');
	},

	addMember: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(addMemberSchema));

		if (!form.valid) {
			return fail(400, { memberForm: form });
		}

		const body: ModifyMembersRequest = {
			member_ids: [form.data.user_id]
		};

		try {
			await addGroupMembers(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Member added successfully');
	},

	removeMember: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('user_id') as string;

		const body: ModifyMembersRequest = {
			member_ids: [userId]
		};

		try {
			await removeGroupMembers(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'removeMember' };
	}
};
