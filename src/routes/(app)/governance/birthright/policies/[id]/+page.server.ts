import type { Actions, PageServerLoad } from './$types';
import { error, redirect, isRedirect } from '@sveltejs/kit';
import {
	getBirthrightPolicy,
	enableBirthrightPolicy,
	disableBirthrightPolicy,
	archiveBirthrightPolicy
} from '$lib/api/birthright';
import { listEntitlements } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let policy;
	try {
		policy = await getBirthrightPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load policy');
	}

	let entitlementMap: Record<string, string> = {};
	try {
		const result = await listEntitlements(
			{ status: 'active', limit: 100 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		entitlementMap = Object.fromEntries(result.items.map((e) => [e.id, e.name]));
	} catch {
		// Graceful fallback — entitlement names will show truncated IDs
	}

	return { policy, entitlementMap };
};

export const actions: Actions = {
	enable: async ({ params, locals, fetch }) => {
		try {
			await enableBirthrightPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return { error: e.message };
			return { error: 'Failed to enable policy' };
		}
		redirect(302, `/governance/birthright/policies/${params.id}`);
	},

	disable: async ({ params, locals, fetch }) => {
		try {
			await disableBirthrightPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return { error: e.message };
			return { error: 'Failed to disable policy' };
		}
		redirect(302, `/governance/birthright/policies/${params.id}`);
	},

	archive: async ({ params, locals, fetch }) => {
		try {
			await archiveBirthrightPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return { error: e.message };
			return { error: 'Failed to archive policy' };
		}
		redirect(302, '/governance/birthright');
	}
};
