import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail } from '@sveltejs/kit';
import { updatePersonaSchema, reasonSchema } from '$lib/schemas/persona';
import {
	getPersona,
	updatePersona,
	activatePersona,
	deactivatePersona,
	archivePersona
} from '$lib/api/personas';
import { propagateAttributes } from '$lib/api/persona-expiry';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let persona;
	try {
		persona = await getPersona(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load persona');
	}

	const form = await superValidate(
		{
			display_name: persona.display_name,
			valid_until: persona.valid_until ?? undefined
		},
		zod(updatePersonaSchema)
	);

	return { persona, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updatePersonaSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await updatePersona(
				params.id,
				{
					display_name: form.data.display_name || undefined,
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

		return message(form, 'Persona updated successfully');
	},

	activate: async ({ params, locals, fetch }) => {
		try {
			await activatePersona(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'activated' };
	},

	deactivate: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const reason = formData.get('reason') as string;

		const result = reasonSchema.safeParse({ reason });
		if (!result.success) {
			return fail(400, { error: result.error.issues[0].message });
		}

		try {
			await deactivatePersona(params.id, reason, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'deactivated' };
	},

	archive: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const reason = formData.get('reason') as string;

		const result = reasonSchema.safeParse({ reason });
		if (!result.success) {
			return fail(400, { error: result.error.issues[0].message });
		}

		try {
			await archivePersona(params.id, reason, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'archived' };
	},

	propagate: async ({ params, locals, fetch }) => {
		try {
			const result = await propagateAttributes(params.id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'propagated', attributesUpdated: result.attributes_updated };
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};
