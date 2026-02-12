import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import { editConnectorSchema } from '$lib/schemas/connectors';
import { getConnector, updateConnector } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ConnectorType, UpdateConnectorRequest } from '$lib/api/types';

function buildLdapConfigAndCredentials(data: Record<string, unknown>): { config: Record<string, unknown>; credentials: Record<string, unknown> } {
	return {
		config: {
			host: data.host as string,
			port: Number(data.port || 636),
			base_dn: data.base_dn as string,
			use_ssl: data.use_ssl === 'on',
			search_filter: (data.search_filter as string) || undefined
		},
		credentials: {
			bind_dn: data.bind_dn as string,
			bind_password: data.bind_password as string
		}
	};
}

function buildDatabaseConfigAndCredentials(data: Record<string, unknown>): { config: Record<string, unknown>; credentials: Record<string, unknown> } {
	return {
		config: {
			host: data.host as string,
			port: Number(data.port || 5432),
			database: data.database as string,
			driver: data.driver as string,
			query: (data.query as string) || undefined
		},
		credentials: {
			username: data.username as string,
			password: data.password as string
		}
	};
}

function buildRestApiConfigAndCredentials(data: Record<string, unknown>): { config: Record<string, unknown>; credentials: Record<string, unknown> } {
	const authConfigRaw = (data.auth_config as string) || '{}';
	const headersRaw = data.headers as string;

	const config: Record<string, unknown> = {
		base_url: data.base_url as string,
		auth_type: data.auth_type as string
	};

	if (headersRaw && headersRaw.trim()) {
		config.headers = JSON.parse(headersRaw) as Record<string, unknown>;
	}

	return {
		config,
		credentials: {
			auth_config: JSON.parse(authConfigRaw) as Record<string, unknown>
		}
	};
}

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let connector;
	try {
		connector = await getConnector(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load connector');
	}

	const form = await superValidate(
		{
			name: connector.name,
			description: connector.description ?? undefined
		},
		zod(editConnectorSchema)
	);

	return { connector, form };
};

export const actions: Actions = {
	default: async ({ request, params, locals, fetch }) => {
		const clonedRequest = request.clone();
		const form = await superValidate(request, zod(editConnectorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const formData = await clonedRequest.formData();
		const connectorType = (formData.get('connector_type')?.toString() || '') as ConnectorType;

		const data: Record<string, unknown> = {};
		for (const [key, value] of formData.entries()) {
			data[key] = value;
		}

		let config: Record<string, unknown>;
		let credentials: Record<string, unknown>;
		try {
			switch (connectorType) {
				case 'ldap': {
					const result = buildLdapConfigAndCredentials(data);
					config = result.config;
					credentials = result.credentials;
					break;
				}
				case 'database': {
					const result = buildDatabaseConfigAndCredentials(data);
					config = result.config;
					credentials = result.credentials;
					break;
				}
				case 'rest': {
					const result = buildRestApiConfigAndCredentials(data);
					config = result.config;
					credentials = result.credentials;
					break;
				}
				default:
					return message(form, 'Invalid connector type', { status: 400 as ErrorStatus });
			}
		} catch (e) {
			if (e instanceof SyntaxError) {
				return message(form, 'Invalid JSON in configuration field', {
					status: 400 as ErrorStatus
				});
			}
			throw e;
		}

		const body: UpdateConnectorRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			config,
			credentials
		};

		try {
			await updateConnector(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
			redirect(303, `/connectors/${params.id}`);
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
