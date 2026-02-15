import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, isRedirect, isHttpError, redirect } from '@sveltejs/kit';
import { editScimTargetSchema } from '$lib/schemas/scim-targets';
import { getScimTarget, updateScimTarget } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { UpdateScimTargetRequest, ScimCredentials } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let target;
	try {
		target = await getScimTarget(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load SCIM target');
	}

	const form = await superValidate(
		{
			name: target.name,
			base_url: target.base_url,
			auth_method: target.auth_method,
			deprovisioning_strategy: target.deprovisioning_strategy,
			tls_verify: target.tls_verify ? 'on' : 'off',
			rate_limit_per_minute: target.rate_limit_per_minute,
			request_timeout_secs: target.request_timeout_secs,
			max_retries: target.max_retries
		},
		zod(editScimTargetSchema)
	);

	return { target, form };
};

export const actions: Actions = {
	default: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(editScimTargetSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateScimTargetRequest = {
			name: form.data.name,
			base_url: form.data.base_url,
			auth_method: form.data.auth_method,
			deprovisioning_strategy: form.data.deprovisioning_strategy || undefined,
			...(form.data.tls_verify ? { tls_verify: form.data.tls_verify === 'on' } : {}),
			rate_limit_per_minute: form.data.rate_limit_per_minute || undefined,
			request_timeout_secs: form.data.request_timeout_secs || undefined,
			max_retries: form.data.max_retries !== undefined && form.data.max_retries !== null ? form.data.max_retries : undefined
		};

		// Only include credentials if user provided new values
		const authMethod = form.data.auth_method;
		let hasNewCredentials = false;
		let credentials: ScimCredentials | undefined;

		if (authMethod === 'bearer' && form.data.bearer_token) {
			hasNewCredentials = true;
			credentials = { type: 'bearer', token: form.data.bearer_token };
		} else if (authMethod === 'oauth2' && form.data.client_id && form.data.client_secret) {
			hasNewCredentials = true;
			const scopesStr = form.data.scopes || '';
			const scopes = scopesStr
				.split(',')
				.map((s: string) => s.trim())
				.filter(Boolean);
			credentials = {
				type: 'oauth2',
				client_id: form.data.client_id,
				client_secret: form.data.client_secret,
				token_endpoint: form.data.token_endpoint || '',
				...(scopes.length > 0 ? { scopes } : {})
			};
		}

		if (hasNewCredentials && credentials) {
			body.credentials = credentials;
		}

		try {
			await updateScimTarget(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
			redirect(303, `/settings/scim-targets/${params.id}`);
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
