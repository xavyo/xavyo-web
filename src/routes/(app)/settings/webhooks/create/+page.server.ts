import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createWebhookSubscriptionSchema } from '$lib/schemas/webhooks';
import { listWebhookEventTypes, createWebhookSubscription } from '$lib/api/webhooks';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createWebhookSubscriptionSchema));

	let eventTypes: { event_type: string; category: string; description: string }[] = [];
	try {
		const result = await listWebhookEventTypes(locals.accessToken!, locals.tenantId!, fetch);
		eventTypes = result.event_types;
	} catch {
		// Fall back to empty list if event types can't be loaded
	}

	return { form, eventTypes };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createWebhookSubscriptionSchema));
		if (!form.valid) return fail(400, { form });

		const eventTypesArray = form.data.event_types
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

		if (eventTypesArray.length === 0) {
			return message(form, 'Select at least one event type', { status: 400 as ErrorStatus });
		}

		try {
			const result = await createWebhookSubscription(
				{
					name: form.data.name,
					description: form.data.description || undefined,
					url: form.data.url,
					secret: form.data.secret || undefined,
					event_types: eventTypesArray
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			redirect(303, `/settings/webhooks/${result.id}`);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
