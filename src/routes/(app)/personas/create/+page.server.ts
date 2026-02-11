import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { createPersonaSchema } from '$lib/schemas/persona';
import { createPersona, listArchetypes } from '$lib/api/personas';
import { listUsers } from '$lib/api/users';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const form = await superValidate(zod(createPersonaSchema));

	let archetypesResult;
	let usersResult;
	try {
		[archetypesResult, usersResult] = await Promise.all([
			listArchetypes({ is_active: true, limit: 100 }, locals.accessToken!, locals.tenantId!, fetch),
			listUsers({ limit: 100 }, locals.accessToken!, locals.tenantId!, fetch)
		]);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load form data');
	}

	return {
		form,
		archetypes: archetypesResult.items,
		users: usersResult.users
	};
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createPersonaSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await createPersona(
				{
					archetype_id: form.data.archetype_id,
					physical_user_id: form.data.physical_user_id,
					valid_from: form.data.valid_from || undefined,
					valid_until: form.data.valid_until || undefined
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

		redirect(302, '/personas');
	}
};
