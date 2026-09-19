import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
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

	try {
		const [connector, health, correlationRules, correlationThresholds] = await Promise.all([
			getConnector(params.id, locals.accessToken!, locals.tenantId!, fetch),
			getConnectorHealth(params.id, locals.accessToken!, locals.tenantId!, fetch).catch(
				(healthErr) => {
					// Health is supplementary. It's absent for a brand-new connector
					// (404) and the backend also returns 400 "Health service not
					// configured" when no health monitoring is set up. Neither should
					// break the connector detail page — degrade to null and let the UI
					// show "Health data not available yet".
					if (
						healthErr instanceof ApiError &&
						(healthErr.status === 404 || healthErr.status === 400)
					)
						return null;
					throw healthErr;
				}
			),
			listCorrelationRules(
				params.id,
				{ limit: 100, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			getCorrelationThresholds(params.id, locals.accessToken!, locals.tenantId!, fetch).catch(
				(thrErr) => {
					// A connector that has no correlation thresholds configured yet
					// (e.g. a brand-new one) returns 404 here. That's a normal state,
					// not a page failure — degrade to null so the detail page still
					// renders. Without this the whole connector detail 404'd.
					if (thrErr instanceof ApiError && thrErr.status === 404) return null;
					throw thrErr;
				}
			)
		]);
		return {
			connector,
			health,
			correlationRules: correlationRules.items ?? [],
			correlationThresholds
		};
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load connector');
	}
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
