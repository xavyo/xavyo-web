import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import {
	getWebhookSubscription,
	updateWebhookSubscription,
	deleteWebhookSubscription,
	listWebhookDeliveries
} from '$lib/api/webhooks';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const deliveryLimit = Number(url.searchParams.get('dlimit') ?? '20');
	const deliveryOffset = Number(url.searchParams.get('doffset') ?? '0');

	let subscription;
	let deliveries;
	let deliveryTotal = 0;

	try {
		[subscription, deliveries] = await Promise.all([
			getWebhookSubscription(params.id, locals.accessToken!, locals.tenantId!, fetch),
			listWebhookDeliveries(
				params.id,
				{ limit: deliveryLimit, offset: deliveryOffset },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch(() => ({ items: [], total: 0, limit: deliveryLimit, offset: deliveryOffset }))
		]);
		deliveryTotal = deliveries.total;
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load webhook subscription');
	}

	return {
		subscription,
		deliveries: deliveries.items,
		deliveryTotal,
		deliveryLimit,
		deliveryOffset
	};
};

export const actions: Actions = {
	pause: async ({ params, locals, fetch }) => {
		try {
			await updateWebhookSubscription(
				params.id,
				{ enabled: false },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'paused' };
	},

	resume: async ({ params, locals, fetch }) => {
		try {
			await updateWebhookSubscription(
				params.id,
				{ enabled: true },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'resumed' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteWebhookSubscription(
				params.id,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/settings/webhooks');
	}
};
