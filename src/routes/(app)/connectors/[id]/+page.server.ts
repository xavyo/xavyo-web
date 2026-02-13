import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import {
	getConnector,
	getConnectorHealth,
	activateConnector,
	deactivateConnector,
	deleteConnector
} from '$lib/api/connectors';
import {
	listCorrelationRules,
	getCorrelationThresholds
} from '$lib/api/correlation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let connector;
	let health;
	try {
		[connector, health] = await Promise.all([
			getConnector(params.id, locals.accessToken!, locals.tenantId!, fetch),
			getConnectorHealth(params.id, locals.accessToken!, locals.tenantId!, fetch).catch(
				() => null
			)
		]);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load connector');
	}

	// Load correlation data in parallel — catch errors gracefully
	const [correlationRules, correlationThresholds] = await Promise.all([
		listCorrelationRules(params.id, { limit: 100, offset: 0 }, locals.accessToken!, locals.tenantId!, fetch).catch(() => ({ items: [], total: 0 })),
		getCorrelationThresholds(params.id, locals.accessToken!, locals.tenantId!, fetch).catch(() => null)
	]);

	return { connector, health, correlationRules: correlationRules.items ?? [], correlationThresholds };
};

export const actions: Actions = {
	activate: async ({ params, locals, fetch }) => {
		try {
			await activateConnector(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'activated' };
	},

	deactivate: async ({ params, locals, fetch }) => {
		try {
			await deactivateConnector(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'deactivated' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteConnector(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/connectors');
	}
};
