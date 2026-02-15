import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, isRedirect, isHttpError, redirect } from '@sveltejs/kit';
import { createScimTargetSchema } from '$lib/schemas/scim-targets';
import { createScimTarget } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateScimTargetRequest, ScimCredentials } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createScimTargetSchema));
	return { form };
};

function buildCredentials(data: Record<string, unknown>): ScimCredentials {
	const authMethod = data.auth_method as string;
	if (authMethod === 'oauth2') {
		const scopesStr = (data.scopes as string) || '';
		const scopes = scopesStr
			.split(',')
			.map((s: string) => s.trim())
			.filter(Boolean);
		return {
			type: 'oauth2',
			client_id: data.client_id as string,
			client_secret: data.client_secret as string,
			token_endpoint: data.token_endpoint as string,
			...(scopes.length > 0 ? { scopes } : {})
		};
	}
	return {
		type: 'bearer',
		token: data.bearer_token as string
	};
}

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createScimTargetSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const credentials = buildCredentials(form.data as Record<string, unknown>);

		const body: CreateScimTargetRequest = {
			name: form.data.name,
			base_url: form.data.base_url,
			auth_method: form.data.auth_method,
			credentials,
			...(form.data.deprovisioning_strategy ? { deprovisioning_strategy: form.data.deprovisioning_strategy } : {}),
			...(form.data.tls_verify ? { tls_verify: form.data.tls_verify === 'on' } : {}),
			...(form.data.rate_limit_per_minute ? { rate_limit_per_minute: form.data.rate_limit_per_minute } : {}),
			...(form.data.request_timeout_secs ? { request_timeout_secs: form.data.request_timeout_secs } : {}),
			...(form.data.max_retries !== undefined && form.data.max_retries !== null ? { max_retries: form.data.max_retries } : {})
		};

		try {
			const result = await createScimTarget(body, locals.accessToken!, locals.tenantId!, fetch);
			redirect(303, `/settings/scim-targets/${result.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
