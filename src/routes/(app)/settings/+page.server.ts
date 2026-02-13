import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { ErrorStatus } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';
import { updateProfileSchema } from '$lib/schemas/settings';
import { getProfile, updateProfile } from '$lib/api/me';
import { getMfaStatus } from '$lib/api/mfa';
import { getSecurityOverview } from '$lib/api/me';
import { fetchAlerts } from '$lib/api/alerts';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	let profile = null;
	try {
		profile = await getProfile(locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// Profile may not exist on current tenant (e.g., after provisioning).
		// Fall back to JWT-derived user info.
		if (locals.user) {
			profile = {
				id: locals.user.id,
				email: locals.user.email,
				display_name: null,
				first_name: null,
				last_name: null,
				avatar_url: null,
				email_verified: false,
				created_at: new Date().toISOString()
			};
		}
	}

	let mfaStatus = null;
	try {
		mfaStatus = await getMfaStatus(locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// MFA status is non-critical; default to null
	}

	let securityOverview = null;
	try {
		securityOverview = await getSecurityOverview(locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// Security overview is non-critical; default to null
	}

	let unacknowledgedAlertCount = 0;
	try {
		const alertsResult = await fetchAlerts(
			{ limit: 1, acknowledged: false },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		unacknowledgedAlertCount = alertsResult.unacknowledged_count;
	} catch {
		// Non-critical; default to 0
	}

	const form = await superValidate(
		{
			display_name: profile?.display_name ?? '',
			first_name: profile?.first_name ?? '',
			last_name: profile?.last_name ?? '',
			avatar_url: profile?.avatar_url ?? ''
		},
		zod(updateProfileSchema)
	);

	return {
		profile,
		mfaStatus,
		securityOverview,
		unacknowledgedAlertCount,
		form
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(updateProfileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await updateProfile(
				{
					display_name: form.data.display_name,
					first_name: form.data.first_name || undefined,
					last_name: form.data.last_name || undefined,
					avatar_url: form.data.avatar_url || undefined
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		return message(form, 'Profile updated successfully');
	}
};
