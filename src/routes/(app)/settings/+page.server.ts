import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { ErrorStatus } from 'sveltekit-superforms';
import { error, fail } from '@sveltejs/kit';
import { updateProfileSchema } from '$lib/schemas/settings';
import { getProfile, updateProfile } from '$lib/api/me';
import { getMfaStatus } from '$lib/api/mfa';
import { getSecurityOverview } from '$lib/api/me';
import { fetchAlerts } from '$lib/api/alerts';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const [profile, mfaStatus, securityOverview, alertsResult] = await Promise.all([
			getProfile(locals.accessToken, locals.tenantId, fetch),
			getMfaStatus(locals.accessToken, locals.tenantId, fetch),
			getSecurityOverview(locals.accessToken, locals.tenantId, fetch),
			fetchAlerts(
				{ limit: 1, acknowledged: false },
				locals.accessToken,
				locals.tenantId,
				fetch
			)
		]);

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
			unacknowledgedAlertCount: alertsResult.unacknowledged_count,
			form
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load settings');
	}
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
