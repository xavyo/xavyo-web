import type { PageServerLoad, Actions } from './$types';
import { getBirthrightPolicy, enableBirthrightPolicy, disableBirthrightPolicy, archiveBirthrightPolicy, simulatePolicy, analyzeImpact } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect, isRedirect, isHttpError } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const policy = await getBirthrightPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
	return { policy };
};

export const actions: Actions = {
	enable: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		await enableBirthrightPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
		return { success: true };
	},
	disable: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		await disableBirthrightPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
		return { success: true };
	},
	archive: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		try {
			await archiveBirthrightPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/birthright-policies');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) error(e.status, e.body.message);
			throw e;
		}
	},
	simulate: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		const formData = await request.formData();
		const attrsRaw = formData.get('attributes_text') as string;
		const attributes: Record<string, unknown> = {};
		for (const line of attrsRaw.split('\n')) {
			const [key, ...rest] = line.split('=');
			if (key?.trim()) attributes[key.trim()] = rest.join('=').trim();
		}
		const result = await simulatePolicy(params.id, { attributes }, locals.accessToken, locals.tenantId, fetch);
		return { simulation: result };
	},
	impact: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
		if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
		const result = await analyzeImpact(params.id, locals.accessToken, locals.tenantId, fetch);
		return { impact: result };
	}
};
