import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { isHttpError } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import type { ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { hasAdminRole } from '$lib/server/auth';
import { createScimTokenSchema } from '$lib/schemas/scim';
import {
	listScimTokens,
	createScimToken,
	revokeScimToken,
	listScimMappings,
	updateScimMappings
} from '$lib/api/scim';
import { ApiError } from '$lib/api/client';
import type { MappingRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createScimTokenSchema));

	let tokens: Awaited<ReturnType<typeof listScimTokens>> = [];
	let mappings: Awaited<ReturnType<typeof listScimMappings>> = [];

	try {
		[tokens, mappings] = await Promise.all([
			listScimTokens(locals.accessToken!, locals.tenantId!, fetch),
			listScimMappings(locals.accessToken!, locals.tenantId!, fetch)
		]);
	} catch {
		// Fall back to empty arrays if API fails
	}

	return { form, tokens, mappings };
};

export const actions: Actions = {
	createToken: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createScimTokenSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const created = await createScimToken(
				form.data.name,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);

			return {
				form,
				tokenCreated: true,
				createdToken: {
					id: created.id,
					name: created.name,
					token: created.token,
					created_at: created.created_at,
					warning: created.warning
				}
			};
		} catch (e) {
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}
	},

	revokeToken: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Token ID is required' });
		}

		try {
			await revokeScimToken(id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'revoked' };
		} catch (e) {
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	updateMappings: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const scimPaths = formData.getAll('scim_path') as string[];
		const xavyoFields = formData.getAll('xavyo_field') as string[];
		const transforms = formData.getAll('transform') as string[];
		const requiredValues = formData.getAll('required') as string[];

		const mappings: MappingRequest[] = scimPaths.map((scimPath, i) => ({
			scim_path: scimPath,
			xavyo_field: xavyoFields[i] ?? '',
			transform: transforms[i] === '' || transforms[i] === 'none' ? null : (transforms[i] as 'lowercase' | 'uppercase' | 'trim'),
			required: requiredValues[i] === 'true'
		}));

		try {
			await updateScimMappings(
				{ mappings },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, action: 'mappings_updated' };
		} catch (e) {
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};
