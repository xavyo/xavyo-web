import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createConnectorSchema } from '$lib/schemas/connectors';
import { createConnector } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ConnectorType, CreateConnectorRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createConnectorSchema));
	return { form };
};

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

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createConnectorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const connectorType = form.data.connector_type as ConnectorType;

		let config: Record<string, unknown>;
		let credentials: Record<string, unknown>;
		try {
			switch (connectorType) {
				case 'ldap': {
					const result = buildLdapConfigAndCredentials(form.data as Record<string, unknown>);
					config = result.config;
					credentials = result.credentials;
					break;
				}
				case 'database': {
					const result = buildDatabaseConfigAndCredentials(form.data as Record<string, unknown>);
					config = result.config;
					credentials = result.credentials;
					break;
				}
				case 'rest': {
					const result = buildRestApiConfigAndCredentials(form.data as Record<string, unknown>);
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

		const body: CreateConnectorRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			connector_type: connectorType,
			config,
			credentials
		};

		try {
			const result = await createConnector(body, locals.accessToken!, locals.tenantId!, fetch);
			redirect(303, `/connectors/${result.id}`);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
