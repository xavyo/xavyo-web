import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import type { ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateGroupSchema, addMembersSchema } from '$lib/schemas/groups';
import {
	getGroup,
	getGroupMembers,
	updateGroup,
	deleteGroup,
	addGroupMembers,
	removeGroupMember
} from '$lib/api/groups';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let group;
	let membersResponse;
	try {
		[group, membersResponse] = await Promise.all([
			getGroup(params.id, locals.accessToken!, locals.tenantId!, fetch),
			getGroupMembers(params.id, locals.accessToken!, locals.tenantId!, fetch)
		]);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load group');
	}

	const editForm = await superValidate(
		{
			name: group.display_name,
			description: group.description ?? ''
		},
		zod(updateGroupSchema),
		{ id: 'edit' }
	);

	const addMemberForm = await superValidate(zod(addMembersSchema), { id: 'addMember' });

	return { group, members: membersResponse.members, editForm, addMemberForm };
};

export const actions: Actions = {
	edit: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateGroupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await updateGroup(
				params.id,
				{
					display_name: form.data.name || undefined,
					description: form.data.description || undefined
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		return message(form, 'Group updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteGroup(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/groups');
	},

	addMember: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(addMembersSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const memberIds = form.data.member_ids
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

		if (memberIds.length === 0) {
			return message(form, 'At least one valid user ID is required', {
				status: 400 as ErrorStatus
			});
		}

		try {
			await addGroupMembers(
				params.id,
				{ member_ids: memberIds },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		return message(form, 'Members added successfully');
	},

	removeMember: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const memberId = formData.get('member_id')?.toString();
		if (!memberId) return fail(400, { error: 'Member ID required' });

		try {
			await removeGroupMember(params.id, memberId, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'memberRemoved' };
	}
};
