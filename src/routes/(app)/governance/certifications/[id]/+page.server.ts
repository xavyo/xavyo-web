import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, error } from '@sveltejs/kit';
import { createCampaignSchema } from '$lib/schemas/governance';
import {
	getCampaign,
	getCampaignProgress,
	listCampaignItems,
	updateCampaign,
	deleteCampaign,
	launchCampaign,
	cancelCampaign,
	decideCertificationItem
} from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import type { UpdateCampaignRequest, CertificationDecisionRequest } from '$lib/api/types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const token = locals.accessToken!;
	const tenantId = locals.tenantId!;

	try {
		const [campaign, progress, itemsResponse] = await Promise.all([
			getCampaign(params.id, token, tenantId, fetch),
			getCampaignProgress(params.id, token, tenantId, fetch),
			listCampaignItems(params.id, { limit: 50, offset: 0 }, token, tenantId, fetch)
		]);

		const form = await superValidate(
			{
				name: campaign.name,
				description: campaign.description ?? '',
				scope_type: campaign.scope_type,
				scope_config_department: campaign.scope_config?.department ?? '',
				scope_config_application_id: campaign.scope_config?.application_id ?? '',
				scope_config_entitlement_id: campaign.scope_config?.entitlement_id ?? '',
				reviewer_type: campaign.reviewer_type,
				deadline: campaign.deadline
			},
			zod(createCampaignSchema)
		);

		return { campaign, progress, items: itemsResponse.items, form };
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load campaign');
	}
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(createCampaignSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const scopeConfig: Record<string, string> = {};
		if (form.data.scope_config_department)
			scopeConfig.department = form.data.scope_config_department;
		if (form.data.scope_config_application_id)
			scopeConfig.application_id = form.data.scope_config_application_id;
		if (form.data.scope_config_entitlement_id)
			scopeConfig.entitlement_id = form.data.scope_config_entitlement_id;

		const body: UpdateCampaignRequest = {
			name: form.data.name,
			description: form.data.description || undefined,
			scope_type: form.data.scope_type as any,
			scope_config: Object.keys(scopeConfig).length > 0 ? scopeConfig : undefined,
			reviewer_type: form.data.reviewer_type as any,
			deadline: form.data.deadline
		};

		try {
			await updateCampaign(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return { form, updated: true };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteCampaign(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to delete campaign' });
		}

		redirect(302, '/governance');
	},

	launch: async ({ params, locals, fetch }) => {
		try {
			await launchCampaign(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to launch campaign' });
		}

		return { launched: true };
	},

	cancel: async ({ params, locals, fetch }) => {
		try {
			await cancelCampaign(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to cancel campaign' });
		}

		return { cancelled: true };
	},

	decide: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const item_id = formData.get('item_id') as string;
		const decision = formData.get('decision') as string;
		const notes = (formData.get('notes') as string) || undefined;

		if (!item_id || !decision) {
			return fail(400, { error: 'Missing item_id or decision' });
		}

		const body: CertificationDecisionRequest = {
			decision: decision as any,
			notes
		};

		try {
			await decideCertificationItem(item_id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to submit decision' });
		}

		return { decided: true };
	}
};
