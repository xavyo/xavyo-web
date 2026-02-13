import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import { updateWebhookSubscriptionSchema } from '$lib/schemas/webhooks';
import {
	getWebhookSubscription,
	listWebhookEventTypes,
	updateWebhookSubscription
} from '$lib/api/webhooks';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let subscription;
	try {
		subscription = await getWebhookSubscription(
			params.id,
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load webhook subscription');
	}

	let eventTypes: { event_type: string; category: string; description: string }[] = [];
	try {
		const result = await listWebhookEventTypes(locals.accessToken!, locals.tenantId!, fetch);
		eventTypes = result.event_types;
	} catch {
		// Fall back to empty list
	}

	const form = await superValidate(
		{
			name: subscription.name,
			description: subscription.description ?? '',
			url: subscription.url,
			secret: '',
			event_types: subscription.event_types.join(',')
		},
		zod(updateWebhookSubscriptionSchema)
	);

	return { form, subscription, eventTypes };
};

export const actions: Actions = {
	default: async ({ params, request, locals, fetch }) => {
		const form = await superValidate(request, zod(updateWebhookSubscriptionSchema));
		if (!form.valid) return fail(400, { form });

		const updateData: Record<string, unknown> = {};

		if (form.data.name) updateData.name = form.data.name;
		if (form.data.description !== undefined) updateData.description = form.data.description || undefined;
		if (form.data.url) updateData.url = form.data.url;
		if (form.data.secret) updateData.secret = form.data.secret;

		if (form.data.event_types) {
			const eventTypesArray = form.data.event_types
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			if (eventTypesArray.length > 0) {
				updateData.event_types = eventTypesArray;
			}
		}

		try {
			await updateWebhookSubscription(
				params.id,
				updateData as Parameters<typeof updateWebhookSubscription>[1],
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			redirect(303, `/settings/webhooks/${params.id}`);
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
