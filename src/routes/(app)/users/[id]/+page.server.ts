import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateUserSchema } from '$lib/schemas/user';
import { getUser, updateUser, deleteUser, resetUserPassword } from '$lib/api/users';
import { getUserLifecycleStatus } from '$lib/api/lifecycle';
import { ApiError } from '$lib/api/client';
import type { UserLifecycleStatus } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let user;
	try {
		user = await getUser(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load user');
	}

	const form = await superValidate(
		{
			email: user.email,
			roles: user.roles,
			username: undefined
		},
		zod(updateUserSchema)
	);

	// Load lifecycle status (gracefully handle 404/errors)
	let lifecycleStatus: UserLifecycleStatus | null = null;
	try {
		lifecycleStatus = await getUserLifecycleStatus(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// User may not have a lifecycle assignment — silently ignore
	}

	return {
		user,
		form,
		currentUserId: locals.user!.id,
		lifecycleStatus
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
	},

	resetPassword: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const newPassword = formData.get('new_password') as string;

		if (!newPassword || newPassword.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		try {
			const result = await resetUserPassword(
				params.id,
				newPassword,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, action: 'password_reset', sessionsRevoked: result.sessions_revoked };
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	verifyEmail: async ({ params, locals, fetch }) => {
		try {
			await updateUser(
				params.id,
				{ email_verified: true },
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

		return { success: true, action: 'email_verified' };
	}
};
