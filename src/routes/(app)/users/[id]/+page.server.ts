import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { updateUserSchema } from '$lib/schemas/user';
import { getUser, updateUser, deleteUser } from '$lib/api/users';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	const user = await getUser(params.id, locals.accessToken!, locals.tenantId!, fetch);

	const form = await superValidate(
		{
			email: user.email,
			roles: user.roles,
			username: undefined
		},
		zod(updateUserSchema)
	);

	return {
		user,
		form,
		currentUserId: locals.user!.id
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateUserSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await updateUser(
				params.id,
				{
					email: form.data.email || undefined,
					roles: form.data.roles || undefined,
					username: form.data.username || undefined
				},
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

		return message(form, 'User updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteUser(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/users');
	},

	enable: async ({ params, locals, fetch }) => {
		try {
			await updateUser(
				params.id,
				{ is_active: true },
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

		return { success: true, action: 'enabled' };
	},

	disable: async ({ params, locals, fetch }) => {
		if (params.id === locals.user!.id) {
			return fail(400, { error: 'You cannot disable your own account' });
		}

		try {
			await updateUser(
				params.id,
				{ is_active: false },
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

		return { success: true, action: 'disabled' };
	}
};
